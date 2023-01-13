import React, {useCallback, useEffect, useState} from "react";
import {AddComment} from "./components/AddComment";
import {Comment} from "./components/Comment";
import "./styles.css";
import ServerLogs from "./components/ServerLogs";

const WebSocketConnection = new WebSocket("ws://localhost:3001/")
let isLoaded = false
const statusCreated = 201;

function getCommentsFromCache(setComments) {
    const storedComments = localStorage.getItem('comments')
    if (storedComments) {
        setComments(JSON.parse(storedComments))
    }
}

export default function App() {
    const [comments, setComments] = useState([]);
    const [view, setView] = useState(false);
    WebSocketConnection.onmessage = async function (event) {
        const message = JSON.parse(event.data);
        if (message.action === "add") {
            setComments([...comments, message.object])
        } else if (message.action === "edit") {
            const index = comments.findIndex(comment => comment.id === parseInt(message.object.id)) // find the index of the comment
            const newComments = [...comments] // copy the array
            newComments[index] = message.object // replace a comment at index
            await setComments(newComments) // update the state
        } else if (message.action === "delete") {
            setComments(comments.filter(comment => comment.id !== parseInt(message.object.id))) // remove a comment
        }
    }

    const memoizedCallback = useCallback(() => {
        if (!isLoaded) {
            isLoaded = true
            getCommentsFromCache(setComments);
            fetchData();
        }
    }, [isLoaded]);

    useEffect(memoizedCallback, []);

    // creates a localStore cache
    useEffect(() => {
        localStorage.setItem('comments', JSON.stringify(comments));
    }, [comments])

    const fetchData = async () => {
        await fetch(process.env.REACT_APP_MY_API_URL + "/comments?_limit=10")
            .then((response) => response.json())
            .then((data) => setComments(data))
            .catch("Error while getting the comments");
    };

    const onAdd = async (name, email, body) => {
        await fetch(process.env.REACT_APP_MY_API_URL + "/comments", {
            method: "POST",
            body: JSON.stringify({
                name: name,
                email: email,
                body: body,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
            .then((response) => {
                if (response.status === statusCreated) {
                    return response.json();
                } else {
                    return response.json();
                }
            })
            .catch("Error while creating a comment");
    };

    const onEdit = async (id, name, email, body) => {
        await fetch(process.env.REACT_APP_MY_API_URL + `/comments/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: name,
                email: email,
                body: body,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
            .catch("Error while updating comments");
    };

    const onDelete = async (id) => {
        await fetch(process.env.REACT_APP_MY_API_URL + `/comments/${id}`, {
            method: "DELETE",
        })
            .catch("Error while deleting comments");
    };
    const handleLogs = () => {
        setView(true)
    }
    return (
        <body>
        {view ? <ServerLogs setView={setView}/> :
            <div className="App">
                <h1>Comments!</h1>
                <AddComment onAdd={onAdd}/>
                <table border={1} className="form_body">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Body</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {comments.map((comment) => (
                        <Comment
                            id={comment.id}
                            key={comment.id}
                            name={comment.name}
                            email={comment.email}
                            body={comment.body}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                    </tbody>
                </table>
                <button onClick={handleLogs}>Go to Logs</button>
            </div>
        }
        </body>
    );
}