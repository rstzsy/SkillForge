import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./ReadPage.css";

export const mockData = [
  {
    id: 1,
    section: "Section 3",
    title: "VOL 6 Test 6 - Crocodile",
    type: "Gap Filling",
    attempts: 1716,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Type of crocodile studied: crocodiles found in salt water

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "croc1",
      2: "croc2",
      3: "croc3",
      4: "croc4",
      5: "croc5"
    },
    timeLimit: 35
  },
  {
    id: 2,
    section: "Section 3",
    title: "VOL 6 Test 6 - Taking part",
    type: "Multiple Choice",
    attempts: 946,
    img: "/assets/listpic.jpg",
    completed: true,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Taking part in district 1

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 25
  },
  {
    id: 3,
    section: "Section 2",
    title: "VOL 6 Test 6 - The Map",
    type: "Map, Diagram Label, One Answer",
    attempts: 887,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • The Map in Ho Chi Minh city

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 20
  },
  {
    id: 4,
    section: "Section 1",
    title: "VOL 6 Test 6 - A Hotel",
    type: "Gap Filling",
    attempts: 1338,
    img: "/assets/listpic.jpg",
    completed: true,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Hotel in Ba Na Hill

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 15
  },
  {
    id: 5,
    section: "Section 3",
    title: "VOL 6 Test 6 - Crocodile",
    type: "Gap Filling",
    attempts: 1716,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Type of crocodile studied: crocodiles found in salt water

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 40
  },
  {
    id: 6,
    section: "Full Test",
    title: "VOL 6 Test 6 - Taking part",
    type: "Map, Diagram Label, Multiple Choice",
    attempts: 946,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Taking part behind the tree

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 30
  },
  {
    id: 7,
    section: "Section 2",
    title: "VOL 6 Test 6 - The Map",
    type: "Map, Diagram Label, One Answer",
    attempts: 887,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • TThe map in Ha Noi

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 20
  },
  {
    id: 8,
    section: "Section 1",
    title: "VOL 6 Test 6 - A Hotel",
    type: "Gap Filling",
    attempts: 1338,
    img: "/assets/listpic.jpg",
    completed: false,
    submissionFile: null,
    passageText: `
        Researchers have recently conducted a study on crocodiles found in salt water, 
        specifically in the Northern Territory of Australia. This study was unique because 
        it was the first time a satellite transmitter had been used to track crocodiles in this 
        region. In the past, researchers had relied on tags, which was a stressful method for the 
        animals and often unreliable due to the frequent loss of the signal.\n
        The government's management of crocodiles has raised concerns, prompting the need for 
        more accurate data. Key research questions included how far crocodiles can travel and how 
        easily they can adapt to changing environments. Observing crocodiles in the wild poses a 
        significant challenge, as these animals are notoriously difficult to monitor without disturbing 
        their natural behavior.\n
        The results of this study are expected to provide valuable insights for wildlife management and 
        conservation efforts, helping ensure that crocodile populations are monitored effectively while 
        minimizing stress to the animals.
        `,

    passage: `
      • Hotel in Area

      • Location of study: Northern Territory, Australia

      • Significance of study: unique because it was the first time a (1) ___ had been used to track crocodiles

      Previous studies:
      • Done using (2) ___
      • Stressful method, also unreliable due to loss of the (3) ___

      Reasons for study:
      • The management of crocodiles by the government may not be effective

      Research questions:
      • How far can crocodiles travel?
      • How easily can crocodiles (4) ___ ?

      Challenge:
      • Crocodiles are difficult to (5) ___ in the wild
    `,
    // blank de user nhap
    blanks: [
      { id: 1, answer: "" },
      { id: 2, answer: "" },
      { id: 3, answer: "" },
      { id: 4, answer: "" },
      { id: 5, answer: "" }
    ],
    correctAnswers: {
      1: "satellite transmitter",
      2: "tags",
      3: "signal",
      4: "adapt",
      5: "observe"
    },
    timeLimit: 10
  },
];

const sectionColors = {
  "Section 1": "#d2b5de",
  "Section 2": "#f2b8e4",
  "Section 3": "#c2eff9",
  "Full Test": "#D3D3D3",
};

const ReadingPage = () => {
  const [tab, setTab] = useState("uncompleted");
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const sections = [
    "Section 1",
    "Section 2",
    "Section 3",
    "Full Test",
  ];

  const filteredData = mockData.filter(item => {
    const statusMatch = tab === "completed" ? item.completed : !item.completed;
    const sectionMatch = selectedSection ? item.section === selectedSection : true;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && sectionMatch && searchMatch;
  });

  return (
    <div className="reading-page">
      {/* Sidebar */}
      <aside className="sidebar-read">
        <h3>
          <FontAwesomeIcon icon={faBook} size="x" />Reading Practise
        </h3>
        <div className="filter-group-read active">
          {sections.map((sec) => (
            <label key={sec}>
              <input
                type="radio"
                name="reading"
                checked={selectedSection === sec}
                onChange={() => setSelectedSection(sec)}
              />{" "}
              {sec}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="reading"
              checked={selectedSection === null}
              onChange={() => setSelectedSection(null)}
            />{" "}
            All Sections
          </label>
        </div>
      </aside>

      {/* Main content */}
      <main className="content-read">
        {/* Tabs + Search */}
        <div className="tabs-search-read">
          <div className="tabs-read">
            <button
              className={tab === "uncompleted" ? "active" : ""}
              onClick={() => setTab("uncompleted")}
            >
              Uncomplete Task
            </button>
            <button
              className={tab === "completed" ? "active" : ""}
              onClick={() => setTab("completed")}
            >
              Complete Task
            </button>
          </div>

          <div className="search-read">
            <FontAwesomeIcon icon={faMagnifyingGlass} size="x" color="#dc9f36" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="cards-read">
          {filteredData.map((item) => (
            <div
              className="card-read"
              key={item.id}
              onClick={() => navigate(`/read/${item.id}`)} // chuyen trang lam bai
              style={{ cursor: "pointer" }}
            >
              <img src={item.img} alt={item.title} />
              <div className="card-info-read">
                <span
                  className="section-read"
                  style={{ backgroundColor: sectionColors[item.section] }}
                >
                  {item.section}
                </span>
                <h4>{item.title}</h4>
                <p className="type-read">{item.type}</p>
                <p className="attempts-read">{item.attempts} attempts</p>
                {item.completed && (
                  <span className="completed-label">Completed</span>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && <p>No tasks found.</p>}
        </div>
      </main>
    </div>
  );
};

export default ReadingPage;
