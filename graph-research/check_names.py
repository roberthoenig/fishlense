import json
import backoff
import math
import re
from collections import Counter
import os
import networkx as nx
from networkx.readwrite import json_graph
import openai

openai.api_key = os.environ["OPENAI_API_KEY"]

## Load the graph
# Load the JSON file
with open("data/MC1.json", 'r') as f:
    json_data = json.load(f)

# Convert the JSON data to a networkx graph
graph = json_graph.node_link_graph(json_data)
## Check names with heuristic
def find_sus_heuristic(company_name):
    suspicious_keywords = [    'laundering', 'smuggling', 'trafficking', 'counterfeit',    'blackmarket', 'pirate', 'illegal', 'fraud', 'scam', 'ponzi',    'underground', 'darkweb', 'darknet', 'hacking', 'cybercrime',    'money laundering', 'human trafficking', 'arms trafficking', 'drug',    'child pornography', 'prostitution', 'embezzlement', 'bribery', 'extortion',    'money laundering scheme', 'insider trading', 'market manipulation', 'pyramid scheme',    'phishing', 'ransomware', 'malware', 'identity theft', 'data breach',    'counterfeit goods', 'bootlegging', 'smuggled goods', 'stolen goods', 'forged documents',    'unlicensed gambling', 'tax evasion', 'organized crime', 'terrorist financing',    'arms dealing', 'illegal arms trade', 'human smuggling', 'organ trafficking',    'environmental crime', 'cyber espionage', 'state-sponsored hacking', 'hacktivism',    'ransomware attack', 'cryptojacking', 'cyber extortion', 'ransom payment',    'narcotics', 'opiates', 'heroin', 'cocaine', 'methamphetamine', 'fentanyl',    'illegal fishing', 'overfishing', 'fishing quota', 'poaching', 'whaling',    'wildlife trafficking', 'ivory smuggling', 'endangered species trade', 'poisoning wildlife',    'child labor', 'forced labor', 'slave', 'human rights abuse', 'human exploitation',    'genital mutilation', 'forced marriage', 'honor killing', 'child soldier',    'arms smuggling', 'weapons trafficking', 'missile technology export', 'nuclear proliferation']

    pattern = re.compile('|'.join(suspicious_keywords), re.IGNORECASE)
    if pattern.search(company_name):
        return True
    else:
        return False


for name in graph:
    name = str(name)
    try:
        name = re.sub(r'[\xc2-\xf4][\x80-\xbf]+',lambda m: m.group(0).encode('latin1').decode('utf8'),name)
    except:
        pass
    if find_sus_heuristic(name):
        print(name)

## Check names with chatgpt

output_count = 3

@backoff.on_exception(backoff.expo, openai.error.RateLimitError)
def gpt_with_backoff(messages):
    return openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        n=output_count
    )
def find_sus_gpt(names):
    systemt_prompt = "Given a list of company names that may of may or may not be involved in illegal activities. Some names include words that make them suspicious. Final output should be a comma separated list of the suspicious company names enclosed in square brackets and nothing more. Only include names that are very suspicious."
    messages = []
    messages.append({"role": "system", "content": systemt_prompt})
    messages.append({"role": "user", "content": str(names)})
    resp = gpt_with_backoff(messages)
    sus_names = []
    for choice in resp.choices:
        resp_text = choice.message.content
        resp_text = resp_text[resp_text.find("[")+1:resp_text.find("]")]
        for name in resp_text.split(","):
            sus_names.append(name.strip().lower().replace("'", "").replace('"', ''))
    counts = Counter(sus_names)
    sus_names = []
    for name, count in counts.items():
        if count > math.ceil(output_count/2)-1:
            sus_names.append(name)
    return sus_names

names = []
final_sus_names = []
chunk_size = 300
for name in graph:
    if type(name) != str:
        continue
    try:
        name = re.sub(r'[\xc2-\xf4][\x80-\xbf]+',lambda m: m.group(0).encode('latin1').decode('utf8'),name)
    except:
        continue
    names.append(name)
    if len(names) > chunk_size:
        final_sus_names.extend(find_sus_gpt(names))
        names = []
final_sus_names.extend(find_sus_gpt(names))
print(final_sus_names)

