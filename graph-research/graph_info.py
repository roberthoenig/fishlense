import json
import numpy as np

def summarize_graph(file_path):
    with open(file_path, 'r') as f:
        graph_data = json.load(f)

    directed = graph_data.get("directed", False)
    multigraph = graph_data.get("multigraph", False)
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])

    node_types = {}
    edge_types = {}
    connectivity = {}
    edge_weights = []
    countries = []

    for node in nodes:
        if "type" in node:
            node_type = node["type"]
            if node_type in node_types:
                node_types[node_type] += 1
            else:
                node_types[node_type] = 1
        connectivity[node["id"]] = 0
        if "country" in node:
            countries.append(node["country"])

    for edge in edges:
        edge_type = edge["type"]
        source = edge["source"]
        target = edge["target"]

        connectivity[source] += 1
        connectivity[target] += 1

        if edge_type in edge_types:
            edge_types[edge_type] += 1
        else:
            edge_types[edge_type] = 1

        edge_weights.append(edge["weight"])

    conn_values = np.array(list(connectivity.values()))
    max_conn, min_conn, mean_conn, std_conn = conn_values.max(), conn_values.min(), conn_values.mean(), conn_values.std()
    max_weight, min_weight, mean_weight, std_weight = np.max(edge_weights), np.min(edge_weights), np.mean(edge_weights), np.std(edge_weights)

    print(f"Directed: {directed}")
    print(f"Multigraph: {multigraph}")
    print(f"Total Nodes: {len(nodes)}")
    print(f"Total Edges: {len(edges)}")
    print(f"Number of Countries: {len(set(countries))}")
    print(f"Countries: ", sorted(set(countries)))

    print("\nNode Types:")
    for node_type, count in node_types.items():
        print(f"{node_type}: {count}")

    print("\nEdge Types:")
    for edge_type, count in edge_types.items():
        print(f"{edge_type}: {count}")

    print("\nNode Connectivity:")
    print(f"Max: {max_conn}, Min: {min_conn}, Mean: {mean_conn:.2f}, Std: {std_conn:.2f}")

    print("\nEdge Weights:")
    print(f"Max: {max_weight:.2f}, Min: {min_weight:.2f}, Mean: {mean_weight:.2f}, Std: {std_weight:.2f}")

if __name__ == "__main__":
    file_path = "data/MC1_preprocessed.json"
    summarize_graph(file_path)
