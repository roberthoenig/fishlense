from flask_restful import Api
from flask import request, jsonify
from dummy_server.resources.calculate_scores import get_scores
from dummy_server.resources.get_data import get_graph, get_illegal_nodes, get_user_flags, add_user_flag, add_illegal_node
from dummy_server.resources.cluster import compute_reordering, embed_and_cluster, compute_subgraph, calculate_centrality
from dummy_server.resources.rerun_analysis import rerun_analysis_local

def add_routes(app):
    api = Api(app)

    @app.route('/api/v1/scores', methods=['POST'])
    def get_suspicion_scores():
        data = request.get_json()
        graph = data.get('graph')
        illegal_nodes = data.get('illegal_nodes')
        user_flags = data.get('user_flags')

        scores = get_scores(graph, illegal_nodes, user_flags)
        return scores


    @app.route('/api/v1/graph')
    def get_graph_data():
        return get_graph()
    
    @app.route('/api/v1/rerun_analysis', methods=['POST'])
    def rerun_analysis():
        data = request.get_json()
        return jsonify(rerun_analysis_local(data))


    @app.route('/api/v1/illegal_nodes')
    def get_illegal_nodes_data():
        return get_illegal_nodes()

    @app.route('/api/v1/compute_node_info', methods=["POST", "OPTIONS"])
    def compute_node_info():
        print("hello")
        if request.method == 'OPTIONS':
            # Preflight request. Reply successfully:
            return ''
        data = request.get_json()
        node_ids = data.get('nodeIds')
        return jsonify({"reordering": compute_reordering(node_ids)})


    @app.route('/api/v1/user_flags')
    def get_user_flags_data():
        return get_user_flags()

    @app.route('/api/v1/illegal_nodes', methods=['POST'])
    def add_illegal_node_data():
        data = request.get_json()
        new_node = data.get('new_node')
        if new_node:
            add_illegal_node(new_node)
            return jsonify({"message": f"Added {new_node} to illegal nodes"}), 201
        else:
            return jsonify({"error": "No new_node provided"}), 400

    @app.route('/api/v1/user_flags', methods=['POST'])
    def add_user_flag_data():
        data = request.get_json()
        new_flag = data.get('new_node')
        if new_flag:
            add_user_flag(new_flag)
            return jsonify({"message": f"Added {new_flag} to user flags"}), 201
        else:
            return jsonify({"error": "No new_flag provided"}), 400

    @app.route('/api/v1/calculate_centrality', methods=['POST'])
    def calculate_centrality_endpoint():
        data = request.get_json()
        graph_dict = data.get('graph')
        method = data.get('method', 'degree')
        if graph_dict is not None:
            try:
                centrality = calculate_centrality(graph_dict, method)
                return jsonify(centrality), 200
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
        else:
            return jsonify({"error": "graph is required"}), 400

    @app.route('/api/v1/compute_subgraph', methods=['POST'])
    def compute_subgraph_endpoint():
        data = request.get_json()
        graph_dict = data.get('graph')
        nodes = data.get('nodes')
        method = data.get('method', 'louvain')
        if graph_dict is not None and nodes is not None:
            try:
                subgraph = compute_subgraph(graph_dict, nodes, method)
                return jsonify(subgraph), 200
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
        else:
            return jsonify({"error": "graph and nodes are required"}), 400

    @app.route('/api/v1/embed_and_cluster', methods=['POST'])
    def embed_and_cluster_endpoint():
        data = request.get_json()
        graph_dict = data.get('graph')
        n_components = data.get('n_components', 3)
        n_clusters = data.get('n_clusters', 3)
        if graph_dict is not None:
            try:
                node_labels = embed_and_cluster(graph_dict, n_components, n_clusters)
                return jsonify(node_labels), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 400
        else:
            return jsonify({"error": "graph is required"}), 400

    return api

