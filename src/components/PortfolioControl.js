import React, { useState, useEffect } from 'react';
import NewProjectForm from "./NewProjectForm";
import EditProjectForm from"./EditProjectForm";
import Project from "./Project";
import ProjectList from "./ProjectList";
import { db } from './../firebase.js';
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

function PortfolioControl() {

//Information States
  const [userBio, setUserBio] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [mainProjectList, setMainProjectList] = useState([]);

//Display States
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editing, setEditing] = useState(false); // how can we repurpose editing for skills, projects, and bio?
  const [error, setError] = useState(null);

  useEffect(() => {
    const unSubscribe = onSnapshot(
      collection(db, 'projects'),
      (collectionSnapshot) => {
        const projects = [];
        collectionSnapshot.forEach((doc) => {
          projects.push({
            name: doc.data().name,
            description: doc.data().description,
            link: doc.data().link,
            id: doc.id
          });
        });
        setMainProjectList(projects);
      },
      (error) => {

      }
    );
    return () => unSubscribe();
  }, []);
  
  const handleDeletingProject = async (id) => {
    await deleteDoc(doc(db, "projects", id));
    setSelectedProject(null);
  }

  const handleEditingProject = async (projectToEdit) => {
    const projectRef = doc(db, "projects", projectToEdit.id);
    await updateDoc(projectRef, projectToEdit);
    setEditing(false);
    setSelectedProject(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleAddingProject = async (newProject) => {
    await addDoc(collection(db, "projects"), newProject);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedProject = (id) => {
    const selectedProject = mainProjectList.filter(project => project.id === id)[0];
    setSelectedProject(selectedProject);
  }

  const handleClick = () => {
    if (selectedProject != null) {
      setFormVisibleOnPage(false);
      // new code!
      setSelectedProject(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  let currentlyVisibleState = null;
  let buttonText = null;

  if(error) {
    currentlyVisibleState = <p>There was an error:{error}</p>
  } 
  else if (editing) {
    currentlyVisibleState = <EditProjectForm project = {selectedProject} editProjectProp1 = {handleEditingProject} />;
    buttonText = "Return to Project List";
  } 
  else if (formVisibleOnPage) {
    currentlyVisibleState = <NewProjectForm createNewProjectProp1 = {handleAddingProject} />;
    buttonText = "Return to Project List";
  } 
  else {
    currentlyVisibleState = <ProjectList 
      projectList = {mainProjectList} 
      onClickingEdit1 = {handleEditClick} 
      onClickingDelete1 ={handleDeletingProject} 
      onProjectSelection1 = {handleChangingSelectedProject} />;
    buttonText = "Add Project";
  }

    return (
      <React.Fragment>
        {currentlyVisibleState}
        {error ? null : <button onClick={handleClick}>{buttonText}</button>}
      </React.Fragment>
      );
}
export default PortfolioControl;