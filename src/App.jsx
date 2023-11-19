import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [isEditing, setIsEditing] = useState(null);

  const handlePostClick = () => {
    fetch("http://localhost:3000/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: titulo,
        fecha,
        done: false,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("La respuesta de red no fue correcta.");
        }
        return response.json();
      })
      .then((data) => {
        setTodoList([...todoList, data]);
        setTitulo("");
        setFecha("");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3000/todo/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("La respuesta de red no fue correcta.");
        }
        setTodoList(todoList.filter((todo) => todo.id !== id));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleToggleDone = async (id, newDoneValue) => {
    const todoToUpdate = todoList.find((todo) => todo.id === id);

    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: todoToUpdate.text,
          fecha: todoToUpdate.fecha,
          done: newDoneValue,
        }),
      });

      if (!response.ok) {
        throw new Error("La respuesta de red no fue correcta.");
      }

      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, done: newDoneValue } : todo
      );

      setTodoList(updatedTodoList);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePatch = async (id) => {
    const todoToUpdate = todoList.find((todo) => todo.id === id);

    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: isEditing === id ? editingText : todoToUpdate.text,
          fecha: isEditing === id ? editingDate : todoToUpdate.fecha,
          done: todoToUpdate.done,
        }),
      });

      if (!response.ok) {
        throw new Error("La respuesta de red no fue correcta.");
      }

      const updatedTodoList = todoList.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text: isEditing === id ? editingText : todo.text,
              fecha: isEditing === id ? editingDate : todo.fecha,
            }
          : todo
      );

      setTodoList(updatedTodoList);
      setIsEditing(null); // Termina la edición después de la actualización
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/todo");

        if (!respuesta.ok) {
          throw new Error("No se pudo obtener la información del servidor");
        }

        const datosJson = await respuesta.json();

        setTodoList(datosJson);
      } catch (error) {
        console.error("Error al obtener datos del servidor:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="todo-list">
        <div className="title">
          <label>Task</label>
          <input
            type="text"
            placeholder="ADD Task"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <button onClick={handlePostClick}>Submit</button>
      </div>
      <div className="todo-list">
        {todoList.map((todo) => (
          <div className="card" key={todo.id}>
            {isEditing === todo.id ? (
              <div>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <input
                  type="text"
                  value={editingDate}
                  onChange={(e) => setEditingDate(e.target.value)}
                />
                <button onClick={() => handlePatch(todo.id)}>Save</button>
              </div>
            ) : (
              <div>
                <div className={`headCard ${todo.done ? "done" : "undone"}`}>
                  <h2 className="cardTitle">{todo.text}</h2>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleDone(todo.id, !todo.done)}
                  />
                </div>
                <div className="footCard">
                  <p className="cardDate">{todo.fecha}</p>
                  <button onClick={() => setIsEditing(todo.id)}>Modify</button>
                </div>
              </div>
            )}
            <button className="delete" onClick={() => handleDelete(todo.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
