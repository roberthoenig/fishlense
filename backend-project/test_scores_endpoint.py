import requests
import json

base_url = "http://127.0.0.1:8000"

def test_scores():
    print("Testing '/api/v1/scores' endpoint...")
    url = base_url + "/api/v1/scores"

    print("Getting graph from '/api/v1/graph' endpoint...")
    graph_url = base_url + "/api/v1/graph"
    graph_response = requests.get(graph_url)
    graph = graph_response.json()
    print("Received graph. ", str(graph)[:300], "...")
    print()

    print("Getting illegal_nodes from '/api/v1/illegal_nodes' endpoint...")
    illegal_nodes_url = base_url + "/api/v1/illegal_nodes"
    illegal_nodes_response = requests.get(illegal_nodes_url)
    illegal_nodes = illegal_nodes_response.json()
    print("Received illegal nodes: ", illegal_nodes)
    print()

    print("Getting user_flags from '/api/v1/user_flags' endpoint...")
    user_flags_url = base_url + "/api/v1/user_flags"
    user_flags_response = requests.get(user_flags_url)
    user_flags = user_flags_response.json()
    print("Received user flags: ", user_flags)
    print()

    data = {"graph": graph, "illegal_nodes": illegal_nodes, "user_flags": user_flags}
    response = requests.post(url, json=data)
    scores = response.json()
    sorted_scores = dict(sorted(scores.items(), key=lambda item: -item[1]))

    print("Printing top 10 scores:")
    for i, (k, v) in enumerate(sorted_scores.items()):
        if i > 10:
            break
        print(k, v)

if __name__ == "__main__":
    test_scores()

