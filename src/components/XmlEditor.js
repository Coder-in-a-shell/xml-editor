
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { XMLParser , XMLBuilder , XMLValidator } from 'fast-xml-parser';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

const XmlEditor = ({ userObj }) => {
  const [json, setJson] = useState();
  const [attachment, setAttachment] = useState('');

  let jsonRef = useRef();
  let editorRef = useRef();

  useEffect(() => {
    let options = {
      mode: 'tree',
    };

    let editor = new JSONEditor(jsonRef, options);
    editor.set(json);

    editorRef.current = editor;

    return () => {
      editor.destroy();
    };
  }, [json]);

  useEffect(() => {
    const getRandomJson = async () => {
      const BASE_URL = 'https://random-data-api.com/api/';
      try {
        const jsonData = await axios.get(`${BASE_URL}/users/random_user`);
        return jsonData;
      } catch (err) {
        console.log('error: ', err);
      }
    };

    getRandomJson().then((jsonData) => setJson(jsonData.data));
  }, []);

  const onSubmit = async (event) => {
    if (json === '') return;
    event.preventDefault();

    const builder = new XMLBuilder();

    const xmlData = builder.build(editorRef.current.get());
    const blob = new Blob([xmlData], { type: 'text/xml' });
  
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'data.xml';
    document.body.appendChild(downloadLink);
  
    downloadLink.click();
  
    document.body.removeChild(downloadLink);
  
    alert('XML data is saved');
    setAttachment('');
  };

  const onRefresh = () => {
    window.location.reload();
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;

    const aFile = files[0];

    if (aFile.type !== 'text/xml') {
      alert('The file is not XML format');
      return;
    }

    const readerText = new FileReader();
    readerText.readAsText(aFile);
    readerText.onloadend = (finishedEvent) => {
      const xmlData = finishedEvent.currentTarget.result;
      const parser = new XMLParser();
      const jobj = parser.parse(xmlData);
      setAttachment(jobj);
      editorRef.current.set(jobj);
    };
  };

  const onClearAttachment = () => {
    setAttachment('');

    let fileElement = document.getElementById('attachFile');
    fileElement.value = null;
  };

  return (
    <div>
      <div
        className="jsoneditor-react-container"
        ref={(elem) => (jsonRef = elem)}
      ></div>

      <form onSubmit={onSubmit} className="factoryForm">
        <div className="factoryInput__container">
          <input
            onClick={onRefresh}
            defaultValue="New Random Data"
            className="factoryInput__refresh"
          />
          <input
            type="submit"
            value="Save"
            readOnly
            className="factoryInput__save"
          />
        </div>

        <label htmlFor="attachFile" className="factoryInput__label">
          <span style={{ fontSize: 17 }}>Load XML File</span>
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </label>

        <input
          type="file"
          accept=".xml"
          id="attachFile"
          onChange={onFileChange}
          style={{
            opacity: 0,
          }}
        />

        {attachment && (
          <div className="factoryForm__attachment">
            <div className="factoryForm__clear" onClick={onClearAttachment}>
              <span>Remove</span>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default XmlEditor;
