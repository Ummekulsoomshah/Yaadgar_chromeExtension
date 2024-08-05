import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { nanoid } from "nanoid";
import { onSnapshot, addDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { notesCollection, db } from "./firebase";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = React.useState("");
  const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   localStorage.setItem("notes", JSON.stringify(notes));
  // }, [notes]);
  useEffect(() => {
    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotes(notesArr);
    });
    return unsubscribe;
  }, []);

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
    };

    const newNoteRef = await addDoc(notesCollection, newNote);
   
    setCurrentNoteId(newNoteRef.id);
  }
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  async function deleteNote(noteId) {
    const docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
    setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));
  }
  useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);
  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar
            darkMode={darkMode}
            notes={notes}
            setCurrentNoteId={setCurrentNoteId}
            currentNoteId={currentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
            toggleDarkMode={toggleDarkMode}
          />
          {currentNoteId && notes.length > 0 && (
            <Editor
              darkMode={darkMode}
              currentNoteId={currentNoteId}
              notes={notes}
              setNotes={setNotes}
            />
          )}
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
