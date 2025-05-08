"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";
import { FiTrash2 } from "react-icons/fi";
import {
  Accept,
  DropzoneOptions,
  FileRejection,
  useDropzone
} from "react-dropzone";
import { TbFileUnknown } from "react-icons/tb";
import { CgDanger } from "react-icons/cg";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Separator } from "./separator";
import { Card, CardContent, CardHeader } from "./card";
import { Button } from "./button";
import { MIME_TYPES } from "@/contexts/mime-types";

interface DropzoneProps extends DropzoneOptions {
  name: string,
  maxFileSize?: number,
  value?: File[],
  onChange?: (...ev: any[]) => void,
  /**
  * Example: {"image/png": [".png"], "application/pdf": [".pdf"]}
  * Check this link to see the mime-types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  * @type {Object<[key: string]: string[]>}
  */
  acceptedTypes?: Accept,
  disabled?: boolean,
  allowedFilesPlaceholder?: string
}

const renderFileIcon = (
  mimeType: string,
  iconSize = 9
) => {
  const Item = MIME_TYPES.find((mt) => mt.mime === mimeType);

  if (!Item) {
    return (
      <TbFileUnknown className={`w-${iconSize} h-${iconSize} shrink-0`} />
    )
  }

  return (
    <Item.icon
      className={`w-${iconSize} h-${iconSize} shrink-0`}
      style={{ color: Item.color }}
    />
  )
};

export const Dropzone = ({
  name,
  onChange,
  maxFileSize = 2 * 1024 * 1024,
  acceptedTypes,
  disabled,
  value,
  allowedFilesPlaceholder,
  ...rest
}: DropzoneProps) => {
  const [files, setFiles] = useState<File[]>();

  useEffect(() => {
    if (!value) {
      setFiles(undefined);
    }
  }, [value]);

  const onDrop = useCallback((
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    if (rejectedFiles.length !== 0) {
      toast(
        <CustomToastFileRejections
          rejectedFiles={rejectedFiles}
          maxFileSize={maxFileSize}
        />,
        { duration: 3000 }
      );
    }

    if (acceptedFiles.length !== 0) {
      setFiles((prev) => {
        if (prev) {
          onChange?.([...prev, ...acceptedFiles]);

          return [...prev, ...acceptedFiles]
        }

        onChange?.(acceptedFiles);
        return acceptedFiles;
      });
    }
  }, [maxFileSize, onChange]);

  const {
    open,
    getRootProps,
    getInputProps,
    isDragAccept,
  } = useDropzone({
    multiple: true,
    accept: acceptedTypes,
    maxSize: maxFileSize,
    onDrop: onDrop,
    ...rest,
  });

  const onUploadClick = () => open();
  const onClean = () => {
    onChange?.(undefined);
    setFiles(undefined);
  };

  const onRemove = (index: number) => {
    setFiles(prev => {
      if (!prev) return undefined;

      if (prev.length === 1) {
        onChange?.(undefined);
        return undefined;
      }

      const updatedFiles = prev.filter((_, idx) => idx !== index);

      onChange?.(updatedFiles);
      return updatedFiles;
    });
  }

  return (
    <Card>
      <CardHeader className="p-2 flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <Button
            title="Subir archivo"
            size="sm"
            type="button"
            disabled={disabled}
            onClick={onUploadClick}
          >
            Agregar
          </Button>
          <Button
            title="Limpiar archivos"
            variant="destructive"
            size="sm"
            type="button"
            disabled={disabled}
            onClick={onClean}
          >
            Limpiar
          </Button>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <p>
            Cantidad máxima por archivo: <strong>{maxFileSize / 1024 / 1024}MB</strong>
          </p>
          ,
          <p>
            Archivos permitidos <strong>{allowedFilesPlaceholder ?? "(??)"}</strong>
          </p>
        </div>
      </CardHeader>
      <CardContent
        {...getRootProps()}
        role="button"
        className={cn(
          "bg-secondary/20 h-40 max-h-64 overflow-y-auto relative shadow-inner p-3 flex flex-wrap gap-5 transition-all hover:bg-secondary/30",
          isDragAccept && "bg-secondary/30 border border-dashed border-primary"
        )}
      >
        <input
          hidden
          id={name}
          name={name}
          type="file"
          disabled={disabled}
          {...getInputProps({ onChange })}
        />
        {!files && (
          <div className="absolute inset-0 flex justify-center items-center text-primary text-sm select-none">
            <span className="md:hidden">
              Presiona para adjuntar.
            </span>
            <span className="hidden md:block">
              Arrastra y suelta aquí...
            </span>
          </div>
        )}
        {files?.map((file, index) => (
          <div
            key={index}
            title={file.name}
            onClick={(ev) => ev.stopPropagation()}
            className="flex flex-col items-center bg-secondary/40 rounded-lg shadow h-fit w-fit p-2 relative overflow-hidden group/item"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(index)}
              className="absolute text-rose-50 bg-black/50 inset-0 flex justify-center items-center transition duration-100 opacity-0 group-hover/item:opacity-100"
            >
              <FiTrash2 className="w-6 h-6" />
            </button>
            {renderFileIcon(file.type)}
            <div className="flex flex-col items-center truncate mt-1">
              <span
                title={file.name}
                className="truncate w-14 text-[.8rem]"
              >
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


const CustomToastFileRejections = ({
  rejectedFiles,
  maxFileSize,
}: {
  rejectedFiles: FileRejection[],
  maxFileSize: number,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-destructive font-semibold">
        <CgDanger className="w-5 h-5" />
        <span>
          Documentos inválidos o sobrepasan los {maxFileSize / 1024 / 1024}MB
        </span>
      </div>
      <Separator className="my-3" />
      <ul className="space-y-2">
        {rejectedFiles.map((rejFile, index) => {
          const iconSize = 4;
          const fileType = rejFile.file.type;
          const fileName = rejFile.file.name;
          const mbSize = Math.round((rejFile.file.size / 1024 / 1024) * 10) / 10;

          return (
            <li
              key={`rejected-file-${index}`}
              className="flex items-center gap-2"
            >
              {renderFileIcon(fileType, iconSize)}
              <span className="truncate w-48">
                {fileName}
              </span>
              <span className="font-semibold">
                {mbSize} MB
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}