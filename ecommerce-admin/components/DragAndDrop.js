import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { DeleteIcon, UploadIcon } from "@/Icons/Icons";
import {ReactSortable} from "react-sortablejs";
import Image from "next/image";
import { handleApiCall } from "@/lib/handlers";
import path from 'path';
import { useTranslations } from "next-intl";

export default function DragAndDrop({onFilesChange,maxFiles,existingFiles,acceptedFileTypes}) {
  const tDragAndDrop = useTranslations('DragAndDrop');

  const [dragActive, setDragActive] = useState(false);
  const [reachedMaxFiles, setReachedMaxFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof existingFiles == 'string' && existingFiles.length > 0) {
      let newFiles = [];
      existingFiles.split(',').map((file) => {
        newFiles.push({link:file});
      });
      setFiles(newFiles);
    };
    if (typeof existingFiles == 'object' && existingFiles.length > 0) {
      let newFiles = [];
      existingFiles.map((file) => {
        newFiles.push({link:file});
      });
      setFiles(newFiles);
    }
  }, []);

  async function handleChange(e) {
    if (!maxFiles) maxFiles = 10;
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      if (files.length >= maxFiles) {
        setReachedMaxFiles(true);
        return;
      };
      setReachedMaxFiles(false);
      let attachments = [];
      await uploader(e.target.files, attachments);
      for (const file of files) { attachments.push(file); };
      onFilesChange(attachments);
    };
  };
  async function handleDrop(e) {
    console.log('handle drop')
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      let attachments = [];
      await uploader(e.target.files, attachments);
      for (const file of files) { attachments.push(file); };
      onFilesChange(attachments);
    };
  };

  async function uploader(files, attachments) {
    const data = new FormData();
    for (let i = 0; i < files["length"]; i++) {
      let file = files[i];
      data.append('file', file);
      setIsUploading(true);
      const res = await handleApiCall(axios.post('/api/upload', data), 'uploading file');
      setIsUploading(false);
      file["link"] = res.data.links[0];
      attachments.push(file);
      setFiles(oldFiles => { return [...oldFiles, file]; });
    };
  };

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  function removeFile(fileName, index, ev) {
    console.log('remove file');
    ev.stopPropagation();
    const newArr = [...files];
    newArr.splice(index, 1);
    setFiles([]);
    setFiles(newArr);
    onFilesChange(newArr);
    setReachedMaxFiles(false);
  };
  function updateFilesOrder(newFiles) {
    console.log('update files order');
    if (typeof newFiles?.[0] === 'string' || newFiles?.[0]?.link) {
      setFiles(newFiles);
      onFilesChange(newFiles);
    };
  };

  function openFileExplorer() {
    inputRef.current.value = "";
    inputRef.current.click();
  };

  return (
    <div className="flex flex-col justify-center">
      <form
        className={`${
          dragActive ? "bg-default-200 border border-primary" : "bg-default-100"
        }  relative p-4 rounded-[12px] w-full  min-h-[7rem] text-center flex flex-col items-center justify-center cursor-pointer`}
        onDragEnter={handleDragEnter}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={openFileExplorer}
      >
        <div className={`${isUploading ? 'flex' : 'hidden'} absolute items-center justify-center w-full h-full z-50 bg-slate-900 opacity-60`}>Uploading...</div>
        <input disabled={isUploading}
          placeholder="fileInput"
          className="hidden"
          ref={inputRef}
          type="file"
          multiple={true}
          onChange={handleChange}
          accept={acceptedFileTypes || ".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"}
        />
        {files.length === 0 && (<>
            <div className="absolute text-default-300 opacity-20">
                <UploadIcon className="h-[125px]" />
            </div>
            <p className="z-10 text-textSecondary">
                {tDragAndDrop('drag_and_drop_or')}{" "}
                <span className="font-bold text-blue-600 cursor-pointer">
                <u className="text-primary">{tDragAndDrop('select_files')}</u>
                </span>{" "}
                {tDragAndDrop('to_upload')}
            </p>
        </>)}

        <div className="flex flex-wrap justify-evenly items-center gap-3">
          <ReactSortable className="flex items-center flex-wrap gap-2" list={files} setList={updateFilesOrder}>
            {files.map((file, index) => {
              let extension = path.extname(file.link);
              extension = extension.startsWith('.') ? extension.slice(1) : extension;
              let localLink = '';
              if (extension === 'pdf' || extension === 'epub') localLink = `/images/${extension}-placeholder.png`;
              return (
                <div key={index} className="relative flex flex-col items-center h-[120px]">
                  <div className="relative group">
                    <div className="flex items-center justify-center w-[100px] h-[100px]">
                      {localLink ? (
                        <Image fill={true} src={localLink} alt={localLink} className="group-hover:brightness-50 max-w-[100px] max-h-[100px] rounded-lg" />
                      ) : (
                        <Image fill={true} src={file.link} alt={file.link} className="group-hover:brightness-50 max-w-[100px] max-h-[100px] rounded-lg" />
                      )}
                    </div>
                    <a onClick={(ev) => removeFile(file.link, index, ev)} 
                        className="invisible group-hover:visible absolute flex items-center justify-center w-full h-full top-0 left-0 text-lg text-danger cursor-move active:opacity-50">
                      <DeleteIcon className='cursor-pointer'/>
                    </a>
                  </div>
                  <span className="absolute bottom-0 max-w-[100px] hover:bg-default-300 hover:max-w-[none] hover:z-index-10 text-sm px-1 rounded overflow-hidden text-ellipsis">{file.name}</span>
                </div>
              );
            })}
          </ReactSortable>
        </div>
      </form>
      {reachedMaxFiles && <div className="mt-1.5 text-xs text-danger">{tDragAndDrop('reached_maximum')}</div>}
      {acceptedFileTypes && <div className="mt-1.5 text-sm text-textSecondary">{tDragAndDrop('accepted_file_types', {'types':acceptedFileTypes})}</div>}
    </div>
  );
}