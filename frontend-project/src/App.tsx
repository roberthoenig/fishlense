// @ts-nocheck 

import './App.css';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import UploadIcon from '@mui/icons-material/Upload';
import SaveIcon from '@mui/icons-material/Save';
import { Grid, Col } from "@tremor/react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Button } from "@tremor/react";
import Typography from '@mui/material/Typography';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Callout } from "@tremor/react";
import { TextInput } from "@tremor/react";
import TextField from '@mui/material/TextField';
import DrawerComponent from './DrawerComponent'
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import React from 'react';
import fishLenseLogo from './fishLense.svg';
import multiselect from './multiselect.png';
import rectselect from './rectselect.png';
import adjmatrix from './adjmatrix.png';
import contextmenu from './contextmenu.png';
import ToggleButton from '@mui/lab/ToggleButton';
import ToggleButtonGroup from '@mui/lab/ToggleButtonGroup';
import suspicion_scores from './suspicion_scores.json';
import feature_vectors from './feature_vectors.json';
import { Chart, registerables } from 'chart.js';
import { scaleLinear } from 'd3';

window.featureVectors = feature_vectors;
// window.featureVectors = new Object();

Chart.register(...registerables)

import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@tremor/react";

import {
  TabList,
  Tab,
  Card,
  Text,
  Metric,
} from "@tremor/react";

import { useState, useEffect } from "react";
import { Add, CheckCircleRounded, DeleteOutlineRounded } from '@mui/icons-material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

//@ts-ignore
window.savedGraphs = {};


function transform(dict) {
  let result = [];
  let index = 0;
  const entries = Object.entries(dict);
  entries.sort((a, b) => {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    } else {
        return 0;
    }
  });
  // // Sort the entries based on a custom function of the values
  // entries.sort((a, b) => {
  //   const valueA = a[1];
  //   const valueB = b[1];
    
  //   // Custom sorting logic based on the values
  //   return valueB - valueA;
  // });
  for (const [nodeId, _] of entries) {
    let name = nodeId.split('|')[0];  // Extract name from nodeId
    let suspiciousness = dict[nodeId];
    result.push({ index, suspiciousness, name, nodeId });
    index++;
  }
  return result;
}


function transform2(dict) {
  let result = [];
  let index = 0;
  const entries = Object.entries(dict);
  entries.sort((a, b) => {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    } else {
        return 0;
    }
  });
  // // Sort the entries based on a custom function of the values
  // entries.sort((a, b) => {
  //   const valueA = a[1];
  //   const valueB = b[1];
    
  //   // Custom sorting logic based on the values
  //   return valueB - valueA;
  // });
  for (const [nodeId, _] of entries) {
    let name = nodeId.split('|')[0];  // Extract name from nodeId
    let suspiciousness = dict[nodeId];
    if (suspiciousness == 1)
      result.push(nodeId); 
    index++;
  }
  return result;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

import { Bar } from 'react-chartjs-2';


class BarChartWithButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: {
        labels: [
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
        'Pagerank', 'Closeness centrality', 'Clustering Coefficient'],
        datasets: [{
          label: 'Importance of features for node illegality',
          data: [
            0.25233211877418193,
            0.2152835813389664,
            0.0,
            0.25323380017047814,
            -0.18123355928556525,
            -0.04969818159517053,
            0.22939255376349155,
            0.3038386170349574,
            -0.43704998845030696,
            -0.558985149842043,
            0.2531684587943162,
            0.0,
            -0.2958872185876823,
            0.42585113970080013,
            -0.2706618689328205,
            0.0,
             0.0,
            -0.13996371581994785,
            0.0,
            0.0,
            0.20443731064703816,
            0.4358394101621589    
          ],
          borderWidth: 1
        }]
      },
      bias: -6.43609819
    }
    this.handleButtonClick = this.handleButtonClick.bind(this);

  }

  // componentDidUpdate(prevProps) {
  //   // Typical usage, don't forget to compare the props if necessary
  //   const m = this.new_most_illegal_nodes===undefined ? this.props.mostillegalnodes : this.new_most_illegal_nodes;
  //   this.props.setMostIllegalNodes(m);
  // }

  handleButtonClick = async () => {
    console.log("Handling CLICK")
    const url = 'http://' + location.hostname + ':8000/api/v1/rerun_analysis';
    const userVotes = window.iii === undefined ?  this.props.illegalIds : window.iii;
    window.iii = undefined;
    try {
      const postData = userVotes; // replace with your actual node ids
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData ),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      // Update illegal IDs
      this.props.setIllegalIds(transform2(data.suspicion_scores));
      // Update illegal node list
      const setMostIllegalNodes = this.props.setMostIllegalNodes;
      const new_most_illegal_nodes = transform(data.suspicion_scores);
      setMostIllegalNodes(new_most_illegal_nodes);
      window.new_most_illegal_nodes = data.suspicion_scores;
      // this.new_most_illegal_nodes = new_most_illegal_nodes;
      // console.log("new_most_illegal_nodes");
      // console.log(new_most_illegal_nodes);
      // const sleep = ms => new Promise(r => setTimeout(r, ms));
      // useEffect(() => {
      //   setMostIllegalNodes(new_most_illegal_nodes);
      //   console.log("done setting nodes");
      // }, []);
      // await sleep(2000);
      // Update feature vectors
      window.featureVectors = data.feature_vectors;
      // Update tips coloring
      const sgroups = [
        { index: 0, suspiciousness: data.suspicion_scores["oceanfront oasis inc carriers|3172"], name: "oceanfront oasis inc carriers", nodeId: "oceanfront oasis inc carriers|3172" },
        { index: 1, suspiciousness: data.suspicion_scores["mar de la vida ojsc|3177"], name: "mar de la vida ojsc", nodeId: "mar de la vida ojsc|3177" },
        { index: 2, suspiciousness: data.suspicion_scores["979893388|901"], name: "979893388", nodeId: "979893388|901" },
        { index: 3, suspiciousness: data.suspicion_scores["8327|386"], name: "8327", nodeId: "8327|386" }
      ];
      this.props.setSuspicionGroups(sgroups);
      // // Update graph coloring
      const colorScale = scaleLinear()
      .domain([0, 1])
      .range(['white', 'red']);
      window.graph.getNodes().forEach(node => {
        // Update the 'fill' style of each node
        window.NODE = node;
        graph.updateItem(node, {
          style: {
            fill: colorScale(data.suspicion_scores[node.getID()])
          }
        });
      });
      // //@ts-ignore
      window.graph.refresh();
      window.graph.fitView();
      for (const [key, _] of Object.entries(window.suspicion_scores)) {
        window.suspicion_scores[key] = data.suspicion_scores[key];
      }
      // Update state
      this.setState(prevState => ({
        chartData: {
          ...prevState.chartData,
          datasets: prevState.chartData.datasets.map((dataset, i) => 
            i === 0 
            ? { ...dataset, data: data.chartData }
            : dataset
          )
        },
        bias: data.bias
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

  render() {
    return (
      <div>
        <Bar data={this.state.chartData} />
        <p>Bias: {this.state.bias.toFixed(2)}</p>
        <Tooltip title={"Recomputes the importance of features based on the user's node labels."}>
        <Button id={this.props.id} onClick={this.handleButtonClick}>Rerun Analysis</Button>
        </Tooltip>
      </div>
    );
  }
}

export default BarChartWithButton;


function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

function App() {

  const actions = [
    { icon: <SaveIcon />, name: 'Export' },
    { icon: <UploadIcon />, name: 'Import' },
  ];
  const style = {
    width: '100%',
    maxWidth: 360,
    bgcolor: 'background.paper',
  };

  const tip_ids = ["oceanfront oasis inc carriers|3172", "mar de la vida ojsc|3177", "979893388|901", "8327|386"];

  const [showGraph, setShowGraph] = useState("2");
  const [counter, setCounter] = useState(2);
  const [nodegroups, setNodeGroups] = useState([{ index: 0, name: "", description: "", email:"" }]);
  const [suspiciongroups, setSuspicionGroups] = useState([
    { index: 0, suspiciousness: suspicion_scores["oceanfront oasis inc carriers|3172"], name: "oceanfront oasis inc carriers", nodeId: "oceanfront oasis inc carriers|3172" },
    { index: 1, suspiciousness: suspicion_scores["mar de la vida ojsc|3177"], name: "mar de la vida ojsc", nodeId: "mar de la vida ojsc|3177" },
    { index: 2, suspiciousness: suspicion_scores["979893388|901"], name: "979893388", nodeId: "979893388|901" },
    { index: 3, suspiciousness: suspicion_scores["8327|386"], name: "8327", nodeId: "8327|386" }
  ]);
  const [illegalIds, setIllegalIds] = useState([
    "armed robbery|166",
    "game thief|1371",
    "illegal|2568",
    "deepwater horizon|2680",
    "shabu|2987",
    "shark fin|3043",
    "illegal|3155",
    "cartel emergent weaponry use|3207",
    "dark web vendor illegal narcotics|3328",
    "heroin cocaine exchange bitcoin|3329",
    "officer pleads guilty|3368",
    "bribes exchange smuggling contraband|3369"
  ]);
  window.setIllegalIds = setIllegalIds;
  const [mostillegalnodes, setMostIllegalNodes] = useState(transform(suspicion_scores));

  const [drawerstate, setDrawerState] = useState(false);
  const [opendialog, setOpenDialog] = useState(false);
  const [email, setEmailName] = useState(String);
  const [nodename, setNodeName] = useState(String);
  const [nodedescription, setNodeDescription] = useState(String);


  const toggleDrawer =
    (anchor: "right", open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }
        setDrawerState(open);
      };

  const handleChange = (e: any, i: number) => {
    //@ts-ignore
    const savedGraph = window.savedGraphs[nodegroups[i].index];
    //@ts-ignore
    graph.destroyLayout();
    //@ts-ignore
    window.graph.read(JSON.parse(JSON.stringify(savedGraph)));
    //@ts-ignore
    graph.fitView();
    const onchangeVal = [...nodegroups]
    setNodeGroups(onchangeVal)
  }

  const handleSusChange = (e: any, nodeId: string) => {
    window.setViewToNode(nodeId);
  }

  function handleImport(event) {
    const file = event.target.files[0];
    // Create a new FileReader object
    const reader = new FileReader();
    // Define what happens when the file is successfully read
    reader.onload = (event) => {
      const fileContent = event.target.result;
      try {
        // Parse the file content string as JSON
        const json = JSON.parse(fileContent);
        window.savedGraphs = json.graphs;
        setNodeGroups(json.nodegroups);
        // handle the json data here
        setIllegalIds(json.illegalIds);
        window.iii = json.illegalIds;
        document.getElementById("barChartWithButtonnn").click();
      } catch (err) {
        // Handle the situation where the file content was not valid JSON
        console.error('Could not parse file content as JSON', err);
      }
    };
    // Start reading the file
    // When finished, the `onload` callback will be triggered
    reader.readAsText(file);
  }

  let fileInput = React.createRef();

  const handleDialClick = (n: String) => {
    if (n === 'Export') {
      //Add the node data here
      var dataStr =
        'data:vast/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify({ nodegroups: nodegroups, graphs: window.savedGraphs, illegalIds: illegalIds }));
      const download = document.createElement('a');
      download.setAttribute('href', dataStr);
      download.setAttribute('download', 'analysis_' + Date().toLocaleString() + '.json');
      document.body.appendChild(download);
      download.click();
      download.remove();

    } else if (n === 'Import') {
      fileInput.current.click();
    }
  }


  const handleClick = (idx: number, n: String, d: String, em: String) => {
    //@ts-ignore
    const graphToSave = window.graph.save();
    const newData = JSON.parse(JSON.stringify(graphToSave));
    //@ts-ignore
    window.savedGraphs[idx] = newData;
    //@ts-ignore
    setNodeGroups([...nodegroups, { index: idx, name: n, description: d, email: em }]);
  }
  window.saveView = handleClick

  const handleDelete = (i: number) => {
    //@ts-ignore
    delete window.savedGraphs[nodegroups[i].index]
    const deleteVal = [...nodegroups]
    deleteVal.splice(i, 1)
    setNodeGroups(deleteVal)
  }
  const clearOutput = () => {
    setNodeDescription("");
    setEmailName("");
    setNodeName("");
  }

  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  const FullScreenOverlay = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 9999,
      }}
    />
  );
  document.body.style.overflow = "hidden"

  const explainingImagesDetailed = [
    { src: multiselect, caption: 'Press shift and left-click to select several nodes.' },
    { src: rectselect, caption: 'Press shift and left-drag to select a rectangle of nodes' },
    { src: contextmenu, caption: 'Right-click on a node to display available graph exploration tools for your selection.' },
    { src: adjmatrix, caption: 'In the left side panel, click "Visualize Connectivity" to show an alternative graph display of your selected nodes.' },
  ];

  return (
    <div>
      <BootstrapDialog
        onClose={() => { setOpenDialog(false) }}
        aria-labelledby="customized-dialog-title"
        open={opendialog}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={() => { setOpenDialog(false) }}>
          Save your investigation!
        </BootstrapDialogTitle>
        <Box
          component="form"
          sx={{ '& > :not(style)': { m: 1, width: '30ch' }, }}
          noValidate
          autoComplete="off"
        >
          <TextInput id="standard-basic" placeholder="Name your investigation..." value={nodename} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setNodeName(event.target.value); }} />
        </Box>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '50ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="outlined-multiline-static"
              label="Description"
              multiline
              rows={5}
              defaultValue="I think it is..."
              value={nodedescription}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setNodeDescription(event.target.value); }}
            />
          <Typography gutterBottom>
            Want to be mentioned in our challenge submission?
          </Typography>
          <Box
          component="form"
          sx={{ '& > :not(style)': { m: 1, width: '30ch' }, }}
          noValidate
          autoComplete="off"
        >
          <TextInput id="standard-basic" placeholder="abc@ethz.ch" value={email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setEmailName(event.target.value); }} />
        </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus variant="secondary" size="lg" onClick={() => { setCounter(counter + 1); handleClick(counter, nodename, nodedescription, email); clearOutput(); setOpenDialog(false) }}>
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
      <main>
        <header>
          <Grid numCols={1} numColsSm={2} numColsLg={10} className="gap-2">
            <Col numColSpan={8}>
              <div>
                <>
                <Box display="flex" justifyContent="center" alignItems="center">
                <img src={fishLenseLogo} alt="logo" style={{ marginRight: '10px', height: '100%'}} />
                </Box>
                  <TabList
                    defaultValue="2"
                    onValueChange={(value) => setShowGraph(value)}
                    className="mt-6"
                    style={{marginTop:'-20px'}}
                  >
                    <Tab value="1" id="user_tip" text="Use Tips" />
                    <Tab value="2" id="detailed_button" text="Detailed" />
                    <Tab value="3" id="overview_button" text="Overview" style={{ visibility: "hidden" }}/>
                    <Tab value="4" id="analysis_button" text="Illegality analysis"/>
                  </TabList>
                </>
                  <div
                    style={{
                      display: showGraph === "2" ? "block" : "none",
                    }}
                  >
                    <iframe scrolling="no"
                      src="./detailedGraphView.html"
                      width="100%"
                      height="1000px"
                    ></iframe>
                  </div>
                  <div
                    style={{
                      display: showGraph === "3" ?  "block" : "none",
                    }}
                  >
                    <iframe id="cosmos" src="./cosmos.html" scrolling="no" width="100%" height="1000px"></iframe>
                  </div>
                  <div
                    style={{
                      display: showGraph === "1" ? "block" : "none",
                    }}
                  >
                    <Grid numCols={2} className="gap-2" style={{paddingTop:"5px"}}>
                      <Col numColSpan={1}>
                        <Card>
                          <Typography variant="h4">Detailed Tab</Typography>
                          <List>
                            {explainingImagesDetailed.map((image, index) => (
                              <ListItem key={index}>
                                <ListItemAvatar>
                                  <Avatar variant="rounded" src={image.src} style={{width: 100,
    height: 100}}/>
                                </ListItemAvatar>
                                <ListItemText primary={image.caption} style={{marginLeft: 10}}/>
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      </Col>
                      <Col numColSpan={1}>
                        <Card>
                          <Typography variant="h4">Overview Tab</Typography>
                          <Text>Unfortunately, there is no documentation for this tab yet. But feel free to explore :).</Text>
                        </Card>
                      </Col>
                    </Grid>
                  </div>
                  <div
                    style={{
                      display: showGraph === "4" ? "block" : "none",
                    }}
                  >
                    <BarChartWithButton id="barChartWithButtonnn" illegalIds={illegalIds} setIllegalIds={setIllegalIds} setMostIllegalNodes={setMostIllegalNodes} mostillegalnodes={mostillegalnodes} setSuspicionGroups={setSuspicionGroups}></BarChartWithButton>
                  </div>
              </div>
            </Col>
            <Col numColSpan={2} numColSpanLg={2} id="right_panel">
              <Card style={{height: "100vh"}}>
              <Card>
                <>
                  <Typography variant="h4">Saved views</Typography>
                </>
                <List sx={style} aria-label="mailbox folders">
                  {
                    nodegroups.map((val, i) => {
                      return val.index > 0 ?
                        <Grid numCols={5} className="gap-2">
                          <Col numColSpan={4}>
                              <Tooltip title={val.description}>
                                <ListItem button onClick={(e) => handleChange(e, i)}>
                                  <ListItemText>
                                    {val.name}
                                  </ListItemText>
                                </ListItem>
                              </Tooltip>
                              <Divider />
                            </Col>
                            <Col numColSpan={1}>
                              <Button icon={DeleteOutlineRounded} variant="light" iconPosition='right' onClick={() => handleDelete(i)} />
                            </Col>
                          </Grid> : <div></div>
                      }
                      )
                    }
                    <ListItem>
                      <Button
                        size="lg"
                        icon={Add}
                        iconPosition='left'
                        variant="light"
                        onClick={() => { setOpenDialog(true) }}
                      >
                        Save view
                      </Button>
                    </ListItem>
                  </List>
                </Card>
                <div style={{ padding: "5px" }}></div>
                <Accordion expanded>
                <AccordionHeader>
                    Tips
                  </AccordionHeader>
                <AccordionBody style={{ height: '30vh', overflowY: 'auto' }}>
                  <List sx={style} aria-label="mailbox folders">
                    {
                      suspiciongroups.map((val, i) => {
                        const [selected, setSelected] = useState(illegalIds.includes(val.nodeId) ? 'illegal' : 'legal');
                        const handleToggle = (event, newSelected) => {
                          event.stopPropagation();
                          if (newSelected !== null) { // Avoid deselecting both options
                            setSelected(newSelected);
                            if (newSelected === 'legal') {
                              setIllegalIds(ids => ids.filter(id => id !== val.nodeId)); // remove nodeId from illegalIds
                            } else {
                              setIllegalIds(ids => [...ids, val.nodeId]);
                            }
                          }
                        };
                        return (
                          <Grid className="gap-2">
                            <ListItem style={{ backgroundColor: `rgb(100%, ${100 - 100*val.suspiciousness}%, ${100 -100*val.suspiciousness}%)`}} button onClick={(e) => handleSusChange(e, val.nodeId)}>
                              <ListItemText style={{ wordWrap: 'break-word' }}> {val.name} </ListItemText>
              
                              <ToggleButtonGroup
                                exclusive
                                value={selected}
                                onChange={handleToggle}
                              >
                                <ToggleButton value="illegal" aria-label="illegal">
                                  <Tooltip title="Illegal">
                                    <WarningIcon />
                                  </Tooltip>
                                </ToggleButton>
              
                                <ToggleButton value="legal" aria-label="legal">
                                  <Tooltip title="Legal">
                                    <CheckCircleIcon />
                                  </Tooltip>
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ListItem>
                            <Divider />
                          </Grid>
                        )
                      })
                    }
                  </List>
                </AccordionBody>
                </Accordion>
                <Accordion expanded>
                  <AccordionHeader>
                    100 most illegal nodes
                  </AccordionHeader>
                  <AccordionBody style={{ height: '30vh', overflowY: 'auto' }}>
                  <List sx={style} aria-label="mailbox folders">
                    {
                      mostillegalnodes.map((val, i) => {
                        const [selected, setSelected] = useState(illegalIds.includes(val.nodeId) ? 'illegal' : 'legal');
                        useEffect(() => {
                          if (selected === 'illegal') {
                            setIllegalIds(ids => [...ids, val.nodeId]);
                          }
                        }, [selected]);
                        const handleToggle = (event, newSelected) => {
                          event.stopPropagation();
                          if (newSelected !== null) { // Avoid deselecting both options
                            setSelected(newSelected);
                            if (newSelected === 'legal') {
                              setIllegalIds(ids => ids.filter(id => id !== val.nodeId));
                            } else {
                              setIllegalIds(ids => [...ids, val.nodeId]);
                            }
                          }
                        };
                        const res = <Grid className="gap-2">
                        <ListItem style={{ backgroundColor: `rgb(100%, ${100 - 100*val.suspiciousness}%, ${100 -100*val.suspiciousness}%)` }}  button onClick={(e) => handleSusChange(e, val.nodeId)}>
                          <ListItemText style={{ wordWrap: 'break-word' }}> {val.name} </ListItemText>
          
                          <ToggleButtonGroup
                            exclusive
                            value={selected}
                            onChange={handleToggle}
                          >
                            <ToggleButton value="illegal" aria-label="illegal">
                              <Tooltip title="Illegal">
                                <WarningIcon />
                              </Tooltip>
                            </ToggleButton>
          
                            <ToggleButton value="legal" aria-label="legal">
                              <Tooltip title="Legal">
                                <CheckCircleIcon />
                              </Tooltip>
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </ListItem>
                        <Divider />
                      </Grid>
                      return [res, val.suspiciousness];
                      }).sort((a, b) => b[1] - a[1]).slice(0, 100).map(x => x[0])
                    }
                  </List>
                </AccordionBody>
                </Accordion>
                <SpeedDial
                  ariaLabel="SpeedDial basic"
                  sx={{ position: 'absolute', bottom: 16, right: 16 }}
                  icon={<SpeedDialIcon />}
                >
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      onClick={() => handleDialClick(action.name)}
                    />
                  ))}
                  <input type="file" style={{ display: 'none' }} ref={fileInput} onChange={handleImport} accept=".json" />
                </SpeedDial>
              </Card>
            </Col>
          </Grid>
        </header>
        <div height={window.innerHeight} id='left_panel'>
          {isResizing && <FullScreenOverlay />}
          <ResizableBox
            width={340}
            height={window.innerHeight}
            // handleSize = {[20, 100]}
            minConstraints={[160, window.innerHeight]}
            maxConstraints={[window.innerWidth / 1.3, window.innerHeight]}
            resizeHandles={['e']}
            onResizeStart={handleResizeStart}
            onResizeStop={handleResizeStop}
          >
            <DrawerComponent drawerState={drawerstate} toggleDrawer={toggleDrawer}
            ></DrawerComponent>
          </ResizableBox>
        </div>
      </main>
    </div>
  )

}

export default App;
