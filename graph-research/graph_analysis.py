import json
import re
import os
import networkx as nx
from networkx.readwrite import json_graph
from community import community_louvain
from pyvis.network import Network
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import umap
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np
import termcolor

## Load the full graph

# Load the JSON file
with open("data/MC1.json", 'r') as f:
    json_data = json.load(f)

# Convert the JSON data to a networkx graph
graph = json_graph.node_link_graph(json_data)

## Extract subgraph as the communities of the entities to investigate
# Compute the best partition using the Louvain method
partition = community_louvain.best_partition(graph.to_undirected())

# Add the community information as a node attribute
for node, community_id in partition.items():
    graph.nodes[node]['community'] = community_id

# Create a subgraph containing the communities of the entities to investigate
entities_to_investigate = ['Mar de la Vida OJSC', 979893388, 'Oceanfront Oasis Inc Carriers', 8327]

subgraph_nodes = set()
for entity in entities_to_investigate:
    community_id = graph.nodes[entity]['community']
    nodes_in_community = [node for node, attr in graph.nodes(data=True) if attr['community'] == community_id]
    subgraph_nodes.update(nodes_in_community)

subgraph = graph.subgraph(subgraph_nodes)

## Calculate different importance scores
# calculate degree centrality
print("Degree centrality")
centrality = nx.degree_centrality(subgraph)
for node, score in centrality.items():
    subgraph.nodes[node]['degree_centrality'] = score
    if score > 0.05:
        print(node, score)
print()

# calculate betweenness centrality
print("Betweenness centrality")
centrality = nx.betweenness_centrality(subgraph)
for node, score in centrality.items():
    subgraph.nodes[node]['betweenness_centrality'] = score
    if score > 0.015:
        print(node, score)

## Path Algorithms: Shortest paths between entities and important nodes
# Find important nodes based on the highest betweenness centrality
num_important_nodes = 3
important_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:num_important_nodes]

print("Shortest paths between entities:")
for i, source in enumerate(entities_to_investigate):
    for target in entities_to_investigate[i+1:]:
        try:
            path = nx.shortest_path(graph, source, target)
            print(f"{source} -> {target}: {path} (length: {len(path) - 1})")
        except nx.NetworkXNoPath as e:
            print(e)

print("\nShortest paths to important nodes:")
for entity in entities_to_investigate:
    for node, _ in important_nodes:
        try:
            path = nx.shortest_path(graph, entity, node)
            print(f"{entity} -> {node}: {path} (length: {len(path) - 1})")
        except nx.NetworkXNoPath as e:
            print(e)

## Graph Embedding 2D
use_umap = True
# Convert the graph to an adjacency matrix
adj_matrix = nx.to_numpy_array(subgraph)

if use_umap: 
    umap_model = umap.UMAP(n_components=2)
    embedding_2d = umap_model.fit_transform(adj_matrix)
else:
    tsne = TSNE(n_components=2)
    embedding_2d = tsne.fit_transform(adj_matrix)

# Get the unique community IDs and assign a color to each
unique_communities = [partition[entity] for entity in entities_to_investigate]
colors = plt.cm.get_cmap('hsv', len(unique_communities))

# Create a color map based on community IDs
color_map = {community_id: colors(i) for i, community_id in enumerate(unique_communities)}

# Prepare the node colors and edgecolors for the plot
node_colors = [color_map[subgraph.nodes[node]['community']] for node in subgraph.nodes()]
edgecolors = ['black' if node in entities_to_investigate else 'none' for node in subgraph.nodes()]

# Visualize the 2D embedding with matplotlib
fig, ax = plt.subplots()
for community_id, color in color_map.items():
    indices = [i for i, node in enumerate(subgraph.nodes()) if subgraph.nodes[node]['community'] == community_id]
    ax.scatter(embedding_2d[indices, 0], embedding_2d[indices, 1], c=[color], label=f'Community {community_id}')
ax.legend()
ax.scatter(embedding_2d[:, 0], embedding_2d[:, 1], c=node_colors, edgecolors=edgecolors)
plt.title("2D Graph Embedding with "+"U-MAP" if use_umap else "t-SNE")
plt.show()

## Graph Embedding Clustering
lower_dimension = 3
if use_umap: 
    umap_model = umap.UMAP(n_components=lower_dimension)
    embedding = umap_model.fit_transform(adj_matrix)
else:
    tsne = TSNE(n_components=lower_dimension)
    embedding = tsne.fit_transform(adj_matrix)

# Perform clustering and find the optimal number of clusters using silhouette score
cluster_range = range(2, 6)
silhouette_scores = []

for n_clusters in cluster_range:
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(embedding)
    silhouette_avg = silhouette_score(embedding, cluster_labels)
    silhouette_scores.append(silhouette_avg)

# Plot the silhouette scores
plt.plot(cluster_range, silhouette_scores, marker='o')
plt.xlabel("Number of Clusters")
plt.ylabel("Silhouette Score")
plt.title("Silhouette Scores for Different Cluster Sizes")
plt.show()

# Choose the optimal number of clusters and perform k-means clustering
optimal_clusters = cluster_range[silhouette_scores.index(max(silhouette_scores))]
kmeans = KMeans(n_clusters=optimal_clusters, random_state=42)
cluster_labels = kmeans.fit_predict(embedding)

# Add the cluster labels as a node attribute
for i, node in enumerate(subgraph.nodes()):
    subgraph.nodes[node]['cluster'] = cluster_labels[i]

print("\nCluster Insights:")
for cluster_id in range(optimal_clusters):
    print(f"Cluster {cluster_id}:")
    cluster_nodes = [node for node, attr in subgraph.nodes(data=True) if attr['cluster'] == cluster_id]
    print(f"Number of nodes: {len(cluster_nodes)}")
    print("Nodes:")
    for node in cluster_nodes:
        if node in entities_to_investigate:
            print(termcolor.colored(node, 'red'), end=", ")
        else:
            print(node, end=", ")
    print("\n")
