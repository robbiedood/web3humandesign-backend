"use strict";
// Javascript program to print connected components in
// an undirected graph
// A user define class to represent a graph.
// A graph is an array of adjacency lists.
// Size of array will be V (number of vertices
// in graph)
// "孤立vortex 不能算在內, 只能加入有被連上的"
// TODO(luke): 請拓展至孤立點
// Vertices 必須從 0, 1, 2,..開始命名, 不能跳號
function getNumofConnected(numOfV, edgeMap) {
    let V;
    let adjListArray = [];
    // constructor
    function Graph(v) {
        V = v;
        // define the size of array as
        // number of vertices
        // Create a new list for each vertex
        // such that adjacent nodes can be stored
        for (let i = 0; i < V; i++) {
            adjListArray.push([]);
        }
    }
    // Adds an edge to an undirected graph
    function addEdge(src, dest) {
        // Add an edge from src to dest.
        adjListArray[src].push(dest);
        // Since graph is undirected, add an edge from dest
        // to src also
        adjListArray[dest].push(src);
    }
    function DFSUtil(v, visited) {
        // Mark the current node as visited and print it
        visited[v] = true;
        // Recur for all the vertices
        // adjacent to this vertex
        for (let x = 0; x < adjListArray[v].length; x++) {
            if (!visited[adjListArray[v][x]])
                DFSUtil(adjListArray[v][x], visited);
        }
    }
    function connectedComponents() {
        // Mark all the vertices as not visited
        let numOfConnectedSubset = 0;
        let visited = new Array(V);
        for (let i = 0; i < V; i++) {
            visited[i] = false;
        }
        for (let v = 0; v < V; ++v) {
            if (!visited[v]) {
                // print all reachable vertices
                // from v
                DFSUtil(v, visited);
                numOfConnectedSubset += 1;
            }
        }
        return numOfConnectedSubset;
    }
    Graph(numOfV); // 5個 Vortex "孤立vortex 不能算在內, 只能加入有被連上的"
    edgeMap.forEach(pair => {
        addEdge(pair[0], pair[1]);
    });
    return connectedComponents();
}
function getConnectedGroups(numOfV, edgeMap) {
    let V;
    let adjListArray = [];
    // constructor
    function Graph(v) {
        V = v;
        // define the size of array as
        // number of vertices
        // Create a new list for each vertex
        // such that adjacent nodes can be stored
        for (let i = 0; i < V; i++) {
            adjListArray.push([]);
        }
    }
    // Adds an edge to an undirected graph
    function addEdge(src, dest) {
        // Add an edge from src to dest.
        adjListArray[src].push(dest);
        // Since graph is undirected, add an edge from dest
        // to src also
        adjListArray[dest].push(src);
    }
    function DFSUtil(v, visited) {
        // Mark the current node as visited and print it
        visited[v] = true;
        // Recur for all the vertices
        // adjacent to this vertex
        for (let x = 0; x < adjListArray[v].length; x++) {
            if (!visited[adjListArray[v][x]])
                DFSUtil(adjListArray[v][x], visited);
        }
    }
    function connectedComponents() {
        // Mark all the vertices as not visited
        let connectedGroup = [];
        let visited = new Array(V);
        for (let i = 0; i < V; i++) {
            visited[i] = false;
        }
        for (let v = 0; v < V; ++v) {
            if (!visited[v]) {
                // print all reachable vertices
                // from v
                let prevVisited = [...visited]; // require true copy of array
                DFSUtil(v, visited);
                let subGroupVortice = [];
                for (let q = 0; q < prevVisited.length; q++) {
                    if (prevVisited[q] ^ visited[q]) {
                        subGroupVortice.push(q);
                    }
                }
                connectedGroup.push(subGroupVortice);
            }
        }
        return connectedGroup;
    }
    Graph(numOfV); // 5個 Vortex "孤立vortex 不能算在內, 只能加入有被連上的"
    edgeMap.forEach(pair => {
        addEdge(pair[0], pair[1]);
    });
    return connectedComponents();
}
// Test code
// let testNumofConnected = getNumofConnected(5, [[0, 1], [1, 2], [3, 4]]);
// let testConnectedGroups = getConnectedGroups(5, [[0, 1], [1, 2], [3, 4]]);
// console.log(testNumofConnected)
// console.log(testConnectedGroups)
module.exports = {
    getNumofConnected,
    getConnectedGroups
};
