import React, {useEffect, useState} from "react";
import {AddComment} from "./components/AddComment";
import {Comment} from "./components/Comment";
import "./styles.css";

const connection = new WebSocket("ws://localhost:3001/")

export default function App() {
    const [comments, setComments] = useState([]);
    connection.onmessage = async function (event) {
        const message = JSON.parse(event.data);
        if (message.action === "add") {
            setComments([...comments, message.object]) // add new comment
        } else if (message.action === "edit") {
            const index = comments.findIndex(comment => comment.id === parseInt(message.object.id)) // find the index of the comment
            const newComments = [...comments] // copy the array
            newComments[index] = message.object // replace a comment at index
            await setComments(newComments) // update the state
            console.log(JSON.stringify(newComments))
        } else if (message.action === "delete") {
            setComments(comments.filter(comment => comment.id !== parseInt(message.object.id))) // remove a comment
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await fetch(process.env.REACT_APP_MY_API_URL + "/comments?_limit=10")
            .then((response) => response.json())
            .then((data) => setComments(data))
            .catch((error) => console.log(error));
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
                if (response.status === 201) {
                    return response.json();
                } else {
                    return response.json();
                }
            })
            .catch((error) => console.log(error));
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
            .catch((error) => console.log(error));
    };

    const onDelete = async (id) => {
        await fetch(process.env.REACT_APP_MY_API_URL + `/comments/${id}`, {
            method: "DELETE",
        })
            .catch((error) => console.log(error));
    };

    return (
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
        </div>
    );
}
