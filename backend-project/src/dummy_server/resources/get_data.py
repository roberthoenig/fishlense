import json

def load_graph(file_path):
    with open(file_path, 'r') as f:
        json_data = json.load(f)
    json_data['links'] = json_data.pop('edges')
    return json_data

graph = None
def get_graph():
    global graph
    if graph is None:
        graph = load_graph("data/MC1_preprocessed.json")
    return graph

def load_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def write_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def get_illegal_nodes():
    return load_json("data/illegal_ids.json")

def get_user_flags():
    return load_json("data/user_flag_ids.json")

def add_illegal_node(new_node):
    illegal_nodes = load_json("data/illegal_ids.json")
    if new_node not in illegal_nodes:
        illegal_nodes.append(new_node)
        write_json("data/illegal_ids.json", illegal_nodes)

def add_user_flag(new_flag):
    user_flags = load_json("data/user_flag_ids.json")
    if new_flag not in user_flags:
        user_flags.append(new_flag)
        write_json("data/user_flag_ids.json", user_flags)

