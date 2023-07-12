import json
import networkx as nx
import numpy as np
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

with open("data/MC1_preprocessed.json", "r") as f:
    data = json.load(f)
df = pd.DataFrame(data['nodes'])
for node in data['nodes']:
    node['type'] = node.get('type', 'unknown')
# Convert data to the format required by networkx
G = nx.MultiDiGraph()
for node in data['nodes']:
    G.add_node(node['id'], attr_dict=node)
for edge in data['edges']:
    G.add_edge(edge['source'], edge['target'], attr_dict=edge)
## Compute all weakly connected components
components = list(nx.weakly_connected_components(G))
## Find the largest component
largest_component = max(components, key=len)
## Create a new graph that only contains the largest component
G = G.subgraph(largest_component).copy()
# Define categories for one-hot encoding
categories = np.array(sorted(list(set([node['type'] for node in data['nodes'] if node['type'] != 'unknown'])))).reshape(-1, 1)
one_hot_encoder = OneHotEncoder(sparse=False)
one_hot_encoder.fit(categories)
betweenness_centralities = nx.betweenness_centrality(G)
closeness_centrality = nx.closeness_centrality(G)
clustering_coefficient = nx.clustering(nx.Graph(G.to_undirected()))
pagerank_scores = nx.pagerank(G)
# Compute feature vectors
feature_vectors = dict()
for node in G.nodes(data=True):
    feature_vector = []
    if node[1]['attr_dict']['type'] == 'unknown':
        feature_vector.extend(np.array([1/len(categories)] * len(categories)))
    else:
        ohv = one_hot_encoder.transform([[node[1]['attr_dict']['type']]])
        feature_vector.extend(ohv[0])
    # Weighted fractions of outgoing and incoming edges
    for edge_type in ['family_relationship', 'partnership', 'membership', 'ownership']: # Update this list with your edge types
        outgoing_edges = [edge[2]['attr_dict']['weight'] for edge in G.out_edges(node[0], data=True) if edge[2]['attr_dict']['type'] == edge_type]
        incoming_edges = [edge[2]['attr_dict']['weight'] for edge in G.in_edges(node[0], data=True) if edge[2]['attr_dict']['type'] == edge_type]
        feature_vector.append(sum(outgoing_edges) / sum([edge[2]['attr_dict']['weight'] for edge in G.out_edges(node[0], data=True)]) if G.out_edges(node[0], data=True) else 0)
        feature_vector.append(sum(incoming_edges) / sum([edge[2]['attr_dict']['weight'] for edge in G.in_edges(node[0], data=True)]) if G.in_edges(node[0], data=True) else 0)
    # Number of incoming and outgoing edges
    feature_vector.append(G.in_degree(node[0]))
    feature_vector.append(G.out_degree(node[0]))
    feature_vector.append(betweenness_centralities[node[0]])
    feature_vector.append(pagerank_scores[node[0]])
    feature_vector.append(closeness_centrality[node[0]])
    feature_vector.append(clustering_coefficient[node[0]])
    feature_vectors[node[0]] = feature_vector
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

def rerun_analysis_local(illegal_node_ids):
    print("illegal_node_ids", illegal_node_ids)
    # Create a list of (node_id, label) pairs
    node_labels = [(node_id, 1 if node_id in illegal_node_ids else 0) for node_id in feature_vectors.keys()]
    # Sort the list by node_id to ensure consistent order
    node_labels.sort(key=lambda x: x[0])
    # Separate the node IDs and labels into two lists
    node_ids, labels = zip(*node_labels)
    # Use the same order to generate the feature vectors
    feature_vector_list = [feature_vectors[node_id] for node_id in node_ids]
    # List of feature descriptions
    feature_descriptions = ['Type: ' + cat for cat in categories[:,0]] + \
                            ['Outgoing fraction: family_relationship', 'Incoming fraction: family_relationship',
                                'Outgoing fraction: partnership', 'Incoming fraction: partnership',
                                'Outgoing fraction: membership', 'Incoming fraction: membership',
                                'Outgoing fraction: ownership', 'Incoming fraction: ownership',
                                'Number of incoming edges', 'Number of outgoing edges', 
                                'Betweenness centrality', 'Pagerank', 'Closeness centrality', 'Clustering Coefficient'] 
                            
    # Scale feature vectors
    scaler = StandardScaler()
    feature_vector_list_scaled = scaler.fit_transform(feature_vector_list)

    # Define logistic regression model with L1 regularization
    model = LogisticRegression(penalty='l1', solver='liblinear', random_state=42, C=1.0)

    # Fit the model
    model.fit(feature_vector_list_scaled, labels)

    # Get the coefficients
    coefs = model.coef_[0]
    intercept = model.intercept_

    # Print the intercept and coefficients
    print("Intercept: ", intercept)
    for feature_description, coef in zip(feature_descriptions, coefs):
        print(f"{feature_description}: {coef}")
        
    # Predict the probabilities
    probabilities = model.predict_proba(feature_vector_list_scaled)[:, 1]
        
    probablities_dict = {node_ids[i]: probabilities[i].tolist() for i in range(len(node_ids))}
    with open("probabilities.json", "w") as f:
        json.dump(probablities_dict, f, indent=1)

    # Create a dictionary that maps each node id to its probability
    # Sort the dictionary by probability, highest first
    # sorted_id_to_probability = sorted(id_to_probability.items(), key=lambda item: item[1], reverse=True)
    
    with open("feature_vectors.json", "w") as f:
        json.dump(feature_vectors, f)
    
    feature_vectors_scaled = {node_ids[i]: feature_vector_list_scaled[i].tolist() for i in range(len(node_ids))}
    with open("feature_vectors_scaled.json", "w") as f:
        json.dump(feature_vectors_scaled, f)
        
    bias = intercept.tolist()[0]
    chartData = coefs.tolist()
    print("chartData", chartData)
    id_to_probability = {id: 1 if id in illegal_node_ids else probability for id, probability in zip(node_ids, probabilities)}
    with open("id_to_probability.json", "w") as f:
        json.dump(id_to_probability, f)
    res = {
        'suspicion_scores': id_to_probability,
        'chartData': chartData,
        'bias': bias,
        'feature_vectors': feature_vectors,
    }
    return res