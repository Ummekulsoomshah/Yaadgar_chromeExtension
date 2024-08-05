import React, { useEffect, useRef, useState } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "../style.css";
import blob from "./blob.png";
import useSpeechToText from "react-hook-speech-to-text";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { notesCollection, db } from "../firebase";
import {
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function Editor({ notes, setNotes, darkMode, currentNoteId }) {
  const notesBody=notes.find((note) => note.id === currentNoteId)?.body || ""
  const pdfRef = useRef()
  const [selectedTab, setSelectedTab] = React.useState("write");
  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });
const downloadpdf=()=>{
  const input = pdfRef.current;
  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF('p','mm','a4',true);
      const pdfWidth=pdf.internal.pageSize.getWidth()
      const pdfHeight=pdf.internal.pageSize.getHeight()
      const imgWidth=canvas.width
      const imgHeight=canvas.height
      const ratio=Math.min(pdfWidth/imgWidth,pdfHeight/imgHeight)
      const imgX=(pdfWidth-imgWidth*ratio)/2
      const imgY=30
      pdf.addImage(imgData,'PNG',imgX,imgY,imgWidth*ratio,imgHeight*ratio)
      pdf.save("download.pdf");
    });
}

  const {
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });
  const onChangeValue = async (value) => {
    const existingNoteIndex = notes.findIndex(
      (note) => note.id === currentNoteId
    );

    setNotes((prevNotes) => {
      const updatedNotes = [...prevNotes];
      updatedNotes[existingNoteIndex] = {
        ...updatedNotes[existingNoteIndex],
        body:
          value || value === ""
            ? value
            : updatedNotes[existingNoteIndex].body +
            " " +
            results.map((result) => result.transcript).join(" ") +
            " ",
      };

      return updatedNotes;
    });
    await updateDoc(doc(db, "notes", currentNoteId), {
      body:
        value || value === ""
          ? value
          : [...notes][existingNoteIndex].body +
          " " +
          results.map((result) => result.transcript).join(" ") +
          " ",
    });
  };
  useEffect(() => {
    if (isRecording && results && results.length > 0) {
      onChangeValue();
      setResults([]);
    }
  }, [isRecording, results]);

  return (
    <>
      <section className={darkMode ? "dark" : "pane editor"}>
        <img src={blob} alt="Blob Vector" className="moving-blob" />
        <div
          ref={pdfRef}
          style={
            {
              backgroundColor: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#333",
              // height:"700px"
            }
          }>

          <ReactMde
            imgurClientId={blob}
            value={notes.find((note) => note.id === currentNoteId)?.body || ""}
            onChange={onChangeValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={(markdown) =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
        </div>
        <div className="btndiv">

          <button className="btns" onClick={isRecording ? stopSpeechToText : startSpeechToText}>
            {isRecording ? "Stop" : "Start"}
          </button>
          <button className="btns"
           onClick={downloadpdf}
          >Download</button>
        </div>
      </section>
    </>
  );
}
