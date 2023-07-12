export const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 20,
    getContent(e) {
      const nodeId = e.item.getModel().id;
      const outDiv = document.createElement('div');
      let descriptors =[
        'Company',
        'Event',
        'Location',
        'Movement',
        'Organization',
        'Person',
        'Political_organization',
        'Vessel',
        'Family relationships, out, fraction',
        'Family relationships, in, fraction',
        'Partnerships, out, fraction',
        'Partnerships, in ,fraction',
        'Outgoing fraction: membership',
        'Incoming fraction: membership',
        'Outgoing fraction: ownership',
        'Incoming fraction: ownership',
        'Incoming edges',
        'Outgoing edges',
        'Betweenness centrality',
        'Pagerank', 'Closeness centrality', 'Clustering Coefficient'];
      
      let featureVector = window.parent.featureVectors[nodeId];
      let htmlContent = `<p style="font-size: larger; font-weight: bold; margin: 0px">
      ${nodeId.split('|')[0]}<br>${e.item.getModel().country ?? ""}<br>`;
      if (featureVector !== undefined) {
        for(let i=0; i<descriptors.length; i++){
            htmlContent += `${descriptors[i]}: ${featureVector[i].toFixed(2)}<br>`
        }
      }
      
      htmlContent += '</p>';
      
      outDiv.innerHTML = htmlContent;
      return outDiv
    },
    itemTypes: ['node']
  });
