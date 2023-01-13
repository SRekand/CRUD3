import React from "react";
import {useEffect, useState} from "react";
import axios from 'axios';

function ServerLogs({setView}) {
    const [logs, setLogs] = useState([]);

    const handleBack = () => {
        setView(false);
    }

    useEffect(() => {
        handleGET();
    }, []);

    const handleGET = () => {
        axios.get("http://localhost:3001/logs")
            .then(response => {
                setLogs(response.data);
                console.log(logs)
            })
    }
    console.log("logs")
    return (
        <>
            <div>
                <h2>Logs</h2>
                <button id="logsBackBtn" onClick={handleBack}>Back</button>
                {logs.map((log, index) => {
                    return (
                        <div id="liLogWrapper" key={index}>
                            <ul>
                                <li id="liLog">{log.timeStamp}</li>
                                <li id="liLog">{log.originalUrl}</li>
                                <li id="liLog">{log.method}</li>
                            </ul>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default ServerLogs;