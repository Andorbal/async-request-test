import React from 'react';
import './App.css';

const handleClick = async (todoText, setTodoText) => {
  const result = await fetch("/api/todo", { method: "PUT", body: JSON.stringify({ title: todoText }) });
  const { requestId } = await result.json();
  console.dir(requestId);
  setTodoText("")
}

function App() {
  React.useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:3001");
    webSocket.onmessage = message => {
      const response = JSON.parse(message.data);
      console.dir(response);
    }
  }, []);
  const [todoText, setTodoText] = React.useState("");

  return (
    <div className="App">
      <header className="App-header">
        <input type="text" value={todoText} onChange={evt => setTodoText(evt.target.value)} />
        <button onClick={() => handleClick(todoText, setTodoText)}>Create todo!</button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
