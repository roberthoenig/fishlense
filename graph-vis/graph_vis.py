import copy
import json
import pickle

from community import community_louvain
from matplotlib import pyplot as plt
import networkx as nx
import pandas as pd
from pyvis.network import Network
import torch


plot_colors_0 = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
]
plot_colors_1 = [
    '#000000', '#ff0000', '#ffff00', '#777777', '#7f7f00', '#00ff00', '#0000ff', '#007f00', '#7f0000',
]


class Node:
    def __init__(self, _uid: str, **nattrs):
        self.uid: str = _uid
        self.nattrs: dict = nattrs
        self.ei: dict[Node, list[Edge]] = {}
        self.eo: dict[Node, list[Edge]] = {}

    def __eq__(self, other):
        if isinstance(other, Node):
            return self.uid == other.uid
        elif isinstance(other, str):
            return self.uid == other
        else:
            return False

    def __hash__(self):
        return hash(self.uid)

    def __repr__(self):
        return repr((self.uid, self.nattrs))


class Edge:
    def __init__(self, _src: Node, _tgt: Node, **eattrs):
        self.src: Node = _src
        self.tgt: Node = _tgt
        self.eattrs: dict = eattrs

    def __repr__(self):
        return repr((self.src.uid, self.tgt.uid))


class G:
    def __init__(self):
        self.nodes: dict[str, Node] = {}
        self.edges: dict[[Node, Node], list[Edge]] = {}

    def add_n(self, *nodes: Node):
        for n in nodes:
            self.nodes[n.uid] = n

    def add_e(self, *edges: Edge):
        for e in edges:
            if (e.src, e.tgt) in self.edges:
                self.edges[e.src, e.tgt].append(e)
            else:
                self.edges[e.src, e.tgt] = [e]
            if e.tgt in e.src.eo:
                e.src.eo[e.tgt].append(e)
            else:
                e.src.eo[e.tgt] = [e]
            if e.src in e.tgt.ei:
                e.tgt.ei[e.src].append(e)
            else:
                e.tgt.ei[e.src] = [e]

    def to_df(self) -> [pd.DataFrame, pd.DataFrame]:
        nodes = pd.DataFrame.from_dict([n.nattrs for n in self.nodes.values()])
        edges = pd.DataFrame.from_dict([e.eattrs for el in self.edges.values() for e in el])
        return nodes, edges

    def to_nx(self, multiedges: bool = True, directed: bool = True) -> nx.Graph:
        if multiedges and directed:
            g = nx.MultiDiGraph()
        elif multiedges:
            g = nx.MultiGraph()
        elif directed:
            g = nx.DiGraph()
        else:
            g = nx.Graph()
        for n in self.get_nodes_uid():
            g.add_nodes_from([(n, {})])
        for (s, t), el in self.edges.items():
            for e in el:
                g.add_edges_from([(s.uid, t.uid, {'weight': e.eattrs['weight']})], )
        return g

    def get_nodes_uid(self):
        return list(self.nodes.keys())

    def sub_graph(self, uids: list[str] = None):
        if uids is None:
            uids = self.get_nodes_uid()
        g = G()
        for n in self.nodes.values():
            if n.uid in uids:
                g.add_n(Node(n.uid, **n.nattrs))
        for (s, t), el in self.edges.items():
            if s.uid in uids and t.uid in uids:
                for e in el:
                    g.add_e(Edge(g.nodes[s.uid], g.nodes[t.uid], **e.eattrs))
        return g

    def bfs(self, start_uid: str, n_layers: int = -1, flatten: bool = True) -> list:
        visited = set()
        results = [[]]
        queue = [start_uid, '']
        while queue and n_layers != 0:
            m = queue.pop(0)
            if m == '':
                n_layers -= 1
                results.append([])
                queue.append('')
                continue
            if m in visited:
                continue
            visited.add(m)
            results[-1].append(m)
            queue += [node.uid for node in self.nodes[m].eo.keys()] + [node.uid for node in self.nodes[m].ei.keys()]
        if flatten:
            return list(visited)
        else:
            return results

    def get_adjacency_mat(self, nodelist: list = None, weighted: bool = False) -> torch.Tensor:
        mat = nx.adjacency_matrix(
            self.to_nx(),
            nodelist=self.get_nodes_uid() if nodelist is None else nodelist,
            weight='weight' if weighted else None
        )
        return torch.tensor(mat.todense())

    def connected_components(self) -> list[list]:
        connected_components = nx.weakly_connected_components(self.to_nx())
        connected_components = sorted([sorted(c) for c in connected_components], key=len, reverse=True)
        return connected_components

    def to_vis(self, html_path: str):
        g = nx.MultiDiGraph()
        for i, (uid, node) in enumerate(self.nodes.items()):
            n = node.nattrs
            properties = {
                'label': (f"[{n['type'][:2].upper()}] " if n['type'] else '') + f"{n['id']}" + (
                    f" ({n['country']})" if n['country'] else ''),
                'color': 'red' if n['*'] else '#0000ff77',
                'size': n['weight'] ** .5,
                **copy.deepcopy(n),
            }
            g.add_nodes_from([(uid, properties), ])
        for (s, t), el in self.edges.items():
            for e in el:
                properties = {
                    'color': f"{plot_colors_0[e.eattrs['etid']]}77",
                    'title': f"[{self.nodes[s.uid].nattrs['id']}] {e.eattrs['type']} [{self.nodes[t.uid].nattrs['id']}]",
                    # 'label': str(e.eattrs['key']),
                    **copy.deepcopy(e.eattrs)
                }
                del properties['source'], properties['target']
                g.add_edges_from([(s.uid, t.uid, properties)], )
        # nx.draw(g)
        # plt.show()
        net = Network(height='1500px', width='1500px', directed=True, notebook=True)
        net.from_nx(g)
        net.repulsion()
        # net.toggle_physics(False)
        if html_path:
            net.show(html_path)


def load_mc1(json_path: str) -> G:
    entities = ['FishEye International', 'Mar de la Vida OJSC', 979893388, 'Oceanfront Oasis Inc Carriers', 8327]
    entities = entities[:2] + entities[3:]

    with open(json_path, 'r') as f:
        data = json.load(f)

    ntypes = sorted([
        '', 'company', 'event', 'location', 'movement', 'organization', 'person', 'political_organization', 'vessel',
    ])
    ntids = {t: i for i, t in enumerate(ntypes)}
    nodes = data['nodes']
    countries = sorted([''] + list(set([node['country'] for node in nodes if 'country' in node])))
    cids = {t: i for i, t in enumerate(countries)}
    nid2uid = {}
    for node in nodes:
        # country, dataset, id, type | cid, ntid, uid, *
        for k in ['country', 'type']:
            if k not in node:
                node[k] = ''
        node['uid'] = nid2uid[node['id']] = f'U{len(nid2uid):>04}'
        node['ntid'] = ntids[node['type']]
        node['cid'] = cids[node['country']]
        node['*'] = node['id'] in entities

    etypes = sorted([
        '', 'family_relationship', 'membership', 'ownership', 'partnership',
    ])
    etids = {t: i for i, t in enumerate(etypes)}
    edges = {}
    for edge in data['links']:
        # dataset, key, source, target, type, weight | srcid, tgtid, etid
        key = edge['srcid'], edge['tgtid'] = nid2uid[edge['source']], nid2uid[edge['target']]
        edge['etid'] = etids[edge['type']]
        if key in edges:
            edges[key].append(edge)
        else:
            edges[key] = [edge]

    g = G()
    for n in nodes:
        g.add_n(Node(n['uid'], **n))
    for el in edges.values():
        for e in el:
            g.add_e(Edge(g.nodes[e['srcid']], g.nodes[e['tgtid']], **e))
    weight_mat = g.get_adjacency_mat(weighted=True)
    weight = weight_mat.sum(0) + weight_mat.sum(1)
    for n, w in zip(g.nodes.values(), weight):
        n.nattrs['weight'] = float(w)
    return g


def vis_top(k: int = 50):
    g = load_mc1('../data/MC1.json')
    g = g.sub_graph(g.connected_components()[0])
    weight_matrix = g.get_adjacency_mat(weighted=True)
    weight_in, weight_out = weight_matrix.sum(0), weight_matrix.sum(1)
    weight = weight_in + weight_out
    weight_order = weight.argsort(descending=True).argsort()
    mask_weight = weight_order < k
    h = g.sub_graph([list(g.get_nodes_uid())[i] for i in mask_weight.nonzero()])
    h.to_vis(f'top_{k}.html')


def vis_bfs(k: int = 2):
    g = load_mc1('../data/MC1.json')
    nodes_df, _ = g.to_df()
    bfs_results = []
    for entity in nodes_df[nodes_df['*']]['uid'].values:
        if g.nodes[entity].nattrs['id'] != 979893388:
            bfs_results += g.bfs(start_uid=entity, n_layers=k)
    bfs_results.sort()
    h = g.sub_graph(bfs_results)
    h.to_vis(f'bfs_{k}.html')


def vis_outliers():
    g = load_mc1('../data/MC1.json')
    components_id = g.connected_components()
    outliers = []
    for i in range(1, len(components_id)):
        outliers += components_id[i]
    g = g.sub_graph(outliers)
    g.to_vis('outliers.html')
    adj_mat = g.get_adjacency_mat(nodelist=outliers, weighted=False)
    plt.imsave('outliers.png', adj_mat.bool().numpy())


def vis_list():
    g = load_mc1('../data/MC1.json')
    with open('name_oi.txt', 'r') as f:
        names = f.readlines()
    names = [i[:-1] for i in names]
    uids = []
    for name in names:
        for uid, n in g.nodes.items():
            if name == n.nattrs['id']:
                uids.append(uid)
                break
    for uid in uids:
        g.nodes[uid].nattrs['*'] = True
    nodes_df, _ = g.to_df()
    bfs_results = []
    for entity in nodes_df[nodes_df['*']]['uid'].values:
        if g.nodes[entity].nattrs['id'] != 979893388:
            bfs_results += g.bfs(start_uid=entity, n_layers=2)
    bfs_results.sort()
    h = g.sub_graph(bfs_results)
    h.to_vis(f'illegal.html')


def mc():
    g = load_mc1('../data/MC1.json')
    g = g.sub_graph(g.connected_components()[0])
    w = g.get_adjacency_mat(weighted=True)
    w = w.to('cuda:0')
    m = torch.nn.functional.normalize(w + w.T, p=1, dim=-1)
    for _ in range(10):
        m2 = m @ m
        diff = (m2 - m).abs().sum()
        m = m2
    p = m.mean(dim=0)
    names = [g.nodes[uid].nattrs['id'] for uid in g.get_nodes_uid()]
    order = p.argsort(descending=True)
    # plt.imsave('mc.png', m.detach().cpu().numpy())
    a = 0


def w2vec():
    g = load_mc1('../data/MC1.json')
    g = g.sub_graph(g.connected_components()[0])
    w = g.get_adjacency_mat(weighted=True)
    w = w.to('cuda:0')
    w = w + w.T
    # w = w @ w @ w  # diameter = 11
    pmi = w.log() + w.sum().log() - w.sum(dim=0, keepdims=True).log() - w.sum(dim=1, keepdims=True).log()
    pmi = pmi.relu()
    u, s, vh = torch.linalg.svd(pmi, full_matrices=False)
    emb = u @ (s ** .5).diag()
    emb = emb[:, :100]
    names = [g.nodes[uid].nattrs['id'] for uid in g.get_nodes_uid()]
    order = (emb @ emb.T).argsort(dim=-1, descending=True)
    # plt.imsave('mc.png', m.detach().cpu().numpy())
    a = 0


def stat():
    g = load_mc1('../data/MC1.json')

    weights = []
    edges = g.edges
    for k, v in edges.items():
        for e in v:
            weights.append(e.eattrs['weight'])
    weights = torch.tensor(weights)
    weights[weights < .8] = .79
    plt.hist(weights.detach().cpu().numpy(), bins=21, range=(.79, 1.))
    plt.xticks([i * .01 for i in range(80, 101, 5)], ['$\leq 0.80$'] + [f"{i * .01 : .2f}" for i in range(85, 101, 5)])
    plt.xlim(.79, 1.)
    plt.xlabel('weight')
    plt.yticks(range(0, 801, 100), [str(i) for i in range(0, 801, 100)])
    plt.ylim(0)
    plt.ylabel('count')
    plt.title('Histogram of Edge Weights')
    # plt.savefig('edge_weight.svg', bbox_inches='tight')
    plt.show()

    adj_mat = g.get_adjacency_mat(weighted=False)
    degree_in = adj_mat.sum(dim=0)
    degree_out = adj_mat.sum(dim=1)
    degree = degree_in + degree_out
    order = degree.argsort()
    node = g.nodes
    degree[degree > 50] = 50 + 1
    plt.hist(degree.detach().cpu().numpy(), bins=int(degree.max()))
    plt.xticks(range(0, 51, 5), [str(i) for i in range(0, 50, 5)] + ['$\geq 50$'])
    plt.xlim(0, int(degree.max()))
    plt.xlabel('degree')
    plt.yscale('log')
    plt.yticks(list(range(1, 10, 1)) + list(range(10, 100, 10)) + list(range(100, 1001, 100)),
               ['1'] + [''] * 8 + ['10'] + [''] * 8 + ['100'] + [''] * 8 + ['1000'])
    plt.ylabel('count')
    plt.title('Histogram of Node Degrees')
    plt.savefig('node_degree.svg', bbox_inches='tight')
    plt.show()

def main():
    # w2vec()
    g = load_mc1('../data/MC1.json')
    nodes, edges = g.to_df()
    edges.to_csv('edges.csv')
    g = g.sub_graph(g.connected_components()[0])
    # adj_mat = g.get_adjacency_mat(weighted=False)
    # plt.imsave('main_cluster.png', adj_mat.bool().numpy())

    # cliques = nx.community.k_clique_communities(g.to_nx(multiedges=False, directed=False), 10, cliques=None)
    # cliques = sorted([sorted(c) for c in cliques], key=len, reverse=True)
    # for i, c in enumerate(cliques):
    #     h = g.sub_graph(c)
    #     h.to_vis(f'cliques/{i:>02}.html')

    # communities = nx.community.girvan_newman(g.to_nx())
    # communities = nx.community.louvain_communities(g.to_nx(), weight='weight')
    partition = community_louvain.best_partition(g.to_nx(directed=False), weight='weight')
    communities = {}
    for node, community_id in partition.items():
        if community_id in communities:
            communities[community_id].append(node)
        else:
            communities[community_id] = [node]
    communities = [list(c) for c in communities.values()]
    # communities = nx.community.greedy_modularity_communities(g.to_nx(), weight='weight')
    communities = sorted([sorted(c) for c in communities], key=len, reverse=True)
    # with open('communities.pkl', 'wb') as f:
    #     pickle.dump(communities, f)
    # with open('communities.pkl', 'rb') as f:
    #     communities = pickle.load(f)
    n_edges = []
    for i, c in enumerate(communities):
        n_edges.append(g.sub_graph(c).to_nx().number_of_edges())
    print(1. - sum(n_edges) / g.to_nx().number_of_edges())
    nodelist = []
    for c in communities:
        nodelist += sorted(c)
    adj_mat = g.get_adjacency_mat(nodelist=nodelist, weighted=False)
    plt.imsave('main_cluster2.png', adj_mat.bool().numpy())
    pass


if __name__ == '__main__':
    main()
