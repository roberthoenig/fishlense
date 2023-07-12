import networkx as nx
from networkx.readwrite import json_graph
from community import community_louvain
from networkx.algorithms import community
import numpy as np
from sklearn.cluster import KMeans
import umap
import numpy as np
from src.dummy_server.resources.get_data import get_graph

def embed_and_cluster(graph_dict, n_components=3, n_clusters=3):
    G = json_graph.node_link_graph(graph_dict)
    adjacency_matrix = nx.adjacency_matrix(G).toarray()
    
    embedding = umap.UMAP(n_components=n_components).fit_transform(adjacency_matrix)
    labels = KMeans(n_clusters=n_clusters).fit_predict(embedding)
    
    node_labels = {list(G.nodes)[i]: int(label) for i, label in enumerate(labels)}
    return node_labels

def compute_subgraph(graph_dict, nodes, method='louvain'):
    G = json_graph.node_link_graph(graph_dict)
    if method == 'louvain':
        partition = community_louvain.best_partition(G.to_undirected())
    elif method == 'girvan_newman':
        gn_communities = community.girvan_newman(G.to_undirected())
        partition = {node: cid for cid, community in enumerate(gn_communities) for node in community}
    else:
        raise ValueError(f"Unknown method: {method}")

    # Extract community ids of given nodes
    community_ids = {partition[node] for node in nodes if node in partition}
    subgraph_nodes = {node for node, community_id in partition.items() if community_id in community_ids}
    subgraph = G.subgraph(subgraph_nodes)

    return json_graph.node_link_data(subgraph)

def calculate_centrality(graph_dict, method='degree'):
    G = json_graph.node_link_graph(graph_dict)
    if method == 'degree':
        centrality = nx.degree_centrality(G)
    elif method == 'betweenness':
        centrality = nx.betweenness_centrality(G)
    elif method == 'closeness':
        centrality = nx.closeness_centrality(G)
    elif method == 'eigenvector':
        centrality = nx.eigenvector_centrality(G)
    else:
        raise ValueError(f"Unknown method: {method}")
    return centrality

def get_adjacency_matrix(node_ids):
    graph = get_graph()
    # Create a dictionary to map node ids to indices
    id_to_index = {id: index for index, id in enumerate(node_ids)}
    # Create an empty adjacency matrix
    adjacency_matrix = np.zeros((len(node_ids), len(node_ids)))
    # Go through the edges in the graph data
    for edge in graph['links']:
        source = edge['source']
        target = edge['target']
        # If both the source and the target are in node_ids, add the weight to the adjacency matrix
        if source in id_to_index and target in id_to_index:
            adjacency_matrix[id_to_index[source]][id_to_index[target]] = edge['weight']
    return adjacency_matrix

def compute_reordering(node_ids):
    adj_mat = get_adjacency_matrix(node_ids)
    reordering = BEA(adj_mat, transitive_similarity=True)
    reordered_node_ids = [node_ids[i] for i in reordering]
    return reordered_node_ids
    

def BEA(S, transitive_similarity=True):
    """
    Order the columns of S to maximize the similarity between
        neighboring columns
    
    :param S - n*n similarity matrix
    :param transitive_similarity - [False by default] consider neighbor's 
        neighbors, etc, in calculating the similarity score.
    """
    
    n = S.shape[0]
    O = [0] #order of the elements to maximize bond energy
    
    for i in range(1,n):
        
        n_pos = len(O)+1 #number of possible possitions to place i
        bondstr = np.zeros((n_pos,)) #value of placing i into each pos
        
        for p in range(n_pos):
            #p puts it between O[p-1] and O[p]
            
            #bond energy contributed from from O[p-1]---i
            if p>=1:
                if transitive_similarity:
                    bond_left = 2*np.inner(S[:,O[p-1]], S[:, i])
                else:
                    bond_left = 2*S[O[p-1], i]
            else:
                bond_left = 0
            
            #bond energy contributed from i---O[p]
            if p<(n_pos-1):
                # print("O[p]", O[p])
                # print("i", i)
                if transitive_similarity:
                    bond_right = 2*np.inner(S[:, O[p]], S[:, i])
                else:
                    bond_right = 2*S[O[p], i]
            else:
                bond_right = 0
                
            #bond energy lost from O[p-1]---O[p]
            if p<(n_pos-1) and p>=1:
                if transitive_similarity:
                    bond_mid = 2*np.inner(S[:, O[p-1]], S[:, O[p]])
                else:
                    bond_mid = 2*S[O[p-1], O[p]]
            else:
                bond_mid = 0
            
            bondstr[p] = bond_left + bond_right - bond_mid
        
        max_pos = np.argmax(bondstr)
        P=np.zeros((n_pos,)).astype(int)
        P[0:max_pos]=O[0:max_pos]
        P[max_pos]=i
        P[(max_pos+1):]=O[(max_pos):]
        O=P
    
    return O.astype(int).tolist()