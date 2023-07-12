import json

import pandas as pd
from neo4j import GraphDatabase
from tqdm import tqdm


def load_mc1(json_path: str):
    entities = ['FishEye International', 'Mar de la Vida OJSC', 979893388, 'Oceanfront Oasis Inc Carriers', 8327]

    with open('name_oi.txt', 'r') as f:
        name_oi = f.readlines()
    name_oi = [s.strip() for s in name_oi]

    with open(json_path, 'r') as f:
        data = json.load(f)

    ntypes = sorted([
        '', 'company', 'event', 'location', 'movement', 'organization', 'person', 'political_organization', 'vessel',
    ])
    nids = {t: f'N{i}' for i, t in enumerate(ntypes)}
    nodes = data['nodes']
    countries = sorted([''] + list(set([node['country'] for node in nodes if 'country' in node])))
    cids = {t: f'C{i:>03}' for i, t in enumerate(countries)}
    nid2uid = {}
    for node in nodes:
        # country, dataset, id, type | cid, nid, uid, *
        for k in ['country', 'type']:
            if k not in node:
                node[k] = ''
        node['u'] = nid2uid[node['id']] = f'U{len(nid2uid):>04}'
        node['n'] = nids[node['type']]
        node['c'] = cids[node['country']]
        node['m'] = node['id'] in entities
        if node['id'] in entities:
            node['m'] = 1
        elif node['id'] in name_oi:
            node['m'] = 2
        else:
            node['m'] = 0
        node['name'] = node['id']
        del node['id']

    etypes = sorted([
        '', 'family_relationship', 'membership', 'ownership', 'partnership',
    ])
    eids = {t: f'E{i}' for i, t in enumerate(etypes)}
    edges = data['links']
    for edge in edges:
        # dataset, key, source, target, type, weight | sid, tid, eid
        edge['s'] = nid2uid[edge['source']]
        edge['t'] = nid2uid[edge['target']]
        edge['e'] = eids[edge['type']]

    # nodes = pd.DataFrame.from_dict(nodes)
    # edges = pd.DataFrame.from_dict(edges)
    return nodes, edges


def add_to_db(nodes, edges):
    def add_node(tx, node):
        tags = [node['u'], node['n'], node['c']]
        # if node['type']:
        #     tags.append(node['type'])
        # if node['country']:
        #     tags.append(node['country'])
        if node['m'] == 1:
            tags.append('M1')
        elif node['m'] == 2:
            tags.append('M2')
        # result = tx.run(
        #     'CREATE (n' + ''.join([f':{tag}' for tag in tags]) + ') SET '
        #     + ', '.join([f"n.{k}=${k}" for k in node.keys()]), **node)
        tx.run(
            'CREATE (n' + ''.join([f':{tag}' for tag in tags]) + ' {' + ', '.join([f'{k}: "{v}"' if isinstance(v, str) else f'{k}: {v}' for k, v in node.items()]) + '})'
        )

    def add_edge(tx, edge):
        tx.run(
            f"MATCH (s:{edge['s']}), (t:{edge['t']}) "
            f"CREATE (s)-[r:{edge['e']} " + '{' + ', '.join([f'{k}: "{v}"' if isinstance(v, str) else f'{k}: {v}' for k, v in edge.items()]) + '}]->(t)'
        )

    driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'password'))
    with driver.session() as session:
        session.execute_write(lambda tx: tx.run('MATCH (n) DETACH DELETE n;'))
        for i, node in tqdm(enumerate(nodes)):
            session.execute_write(add_node, node)
        for i, edge in tqdm(enumerate(edges)):
            session.execute_write(add_edge, edge)
    driver.close()
    pass


def main():
    nodes, edges = load_mc1('../data/MC1.json')
    # with open('data.csv', 'w') as f:
    #     f.write('Source,Target\n')
    #     for e in edges:
    #         f.write(f"{e['s']},{e['t']}\n")
    add_to_db(nodes, edges)


if __name__ == '__main__':
    main()


