import requests
import json

base_url = "http://127.0.0.1:8000"

def test_calculate_centrality():
    print("Testing '/api/v1/calculate_centrality' endpoint...")
    url = base_url + "/api/v1/calculate_centrality"

    print("Getting graph from '/api/v1/graph' endpoint...")
    graph_url = base_url + "/api/v1/graph"
    graph_response = requests.get(graph_url)
    graph = graph_response.json()
    print("Received graph. ", str(graph)[:300], "...")

    data = {"graph": graph, "method": "betweenness"}
    response = requests.post(url, json=data)
    centrality = response.json()

    print("Centrality: ", centrality)
    print()

def test_compute_subgraph():
    print("Testing '/api/v1/compute_subgraph' endpoint...")
    url = base_url + "/api/v1/compute_subgraph"

    print("Getting graph from '/api/v1/graph' endpoint...")
    graph_url = base_url + "/api/v1/graph"
    graph_response = requests.get(graph_url)
    graph = graph_response.json()
    print("Received graph. ", str(graph)[:300], "...")

    data = {"graph": graph, "nodes": ["8327|386", "979893388|901", "oceanfront oasis inc carriers|3172", "mar de la vida ojsc|3177"], "method": "louvain"}
    response = requests.post(url, json=data)
    
    subgraph = response.json()
    print("Subgraph: ", str(subgraph)[:300])
    print()

def test_embed_and_cluster():
    print("Testing '/api/v1/embed_and_cluster' endpoint...")
    url = base_url + "/api/v1/embed_and_cluster"

    print("Getting graph from '/api/v1/graph' endpoint...")
    graph_url = base_url + "/api/v1/graph"
    graph_response = requests.get(graph_url)
    graph = graph_response.json()
    print("Received graph. ", str(graph)[:300], "...")

    data = {"graph": graph, "n_components": 2, "n_clusters": 3}
    response = requests.post(url, json=data)
    node_labels = response.json()

    print("Node labels: ", node_labels)
    print()

if __name__ == "__main__":
    # test_calculate_centrality()
    # test_compute_subgraph()
    test_embed_and_cluster()

