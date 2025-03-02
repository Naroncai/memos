import { Button, Input, Select, Option, Typography, List, ListItem, Autocomplete, Tooltip } from "@mui/joy";
import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useResourceStore } from "../store/module";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";

const fileTypeAutocompleteOptions = ["image/*", "text/*", "audio/*", "video/*", "application/*"];

interface Props extends DialogProps {
  onCancel?: () => void;
  onConfirm?: (resourceList: Resource[]) => void;
}

type SelectedMode = "local-file" | "external-link";

interface State {
  selectedMode: SelectedMode;
  uploadingFlag: boolean;
}

const CreateResourceDialog: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { destroy, onCancel, onConfirm } = props;
  const resourceStore = useResourceStore();
  const [state, setState] = useState<State>({
    selectedMode: "local-file",
    uploadingFlag: false,
  });
  const [resourceCreate, setResourceCreate] = useState<ResourceCreate>({
    filename: "",
    externalLink: "",
    type: "",
  });
  const [fileList, setFileList] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloseDialog = () => {
    if (onCancel) {
      onCancel();
    }
    destroy();
  };

  const handleSelectedModeChanged = (mode: "local-file" | "external-link") => {
    setState((state) => {
      return {
        ...state,
        selectedMode: mode,
      };
    });
  };

  const handleExternalLinkChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const externalLink = event.target.value;
    setResourceCreate((state) => {
      return {
        ...state,
        externalLink,
      };
    });
  };

  const handleFileNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filename = event.target.value;
    setResourceCreate((state) => {
      return {
        ...state,
        filename,
      };
    });
  };

  const handleFileTypeChanged = (fileType: string) => {
    setResourceCreate((state) => {
      return {
        ...state,
        type: fileType,
      };
    });
  };

  const handleFileInputChange = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files) {
      return;
    }

    const files: File[] = [];
    for (const file of fileInputRef.current.files) {
      files.push(file);
    }
    setFileList(files);
  };

  const allowConfirmAction = () => {
    if (state.selectedMode === "local-file") {
      if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) {
        return false;
      }
    } else if (state.selectedMode === "external-link") {
      if (resourceCreate.filename === "" || resourceCreate.externalLink === "" || resourceCreate.type === "") {
        return false;
      }
    }
    return true;
  };

  const handleConfirmBtnClick = async () => {
    if (state.uploadingFlag) {
      return;
    }

    setState((state) => {
      return {
        ...state,
        uploadingFlag: true,
      };
    });

    const createdResourceList: Resource[] = [];
    try {
      if (state.selectedMode === "local-file") {
        if (!fileInputRef.current || !fileInputRef.current.files) {
          return;
        }
        for (const file of fileInputRef.current.files) {
          const resource = await resourceStore.createResourceWithBlob(file);
          createdResourceList.push(resource);
        }
      } else {
        const resource = await resourceStore.createResource(resourceCreate);
        createdResourceList.push(resource);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    }

    if (onConfirm) {
      onConfirm(createdResourceList);
    }
    destroy();
  };

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">{t("resource.create-dialog.title")}</p>
        <button className="btn close-btn" onClick={handleCloseDialog}>
          <Icon.X />
        </button>
      </div>
      <div className="dialog-content-container !w-80">
        <Typography className="!mb-1" level="body2">
          {t("resource.create-dialog.upload-method")}
        </Typography>
        <Select
          className="w-full mb-2"
          onChange={(_, value) => handleSelectedModeChanged(value as SelectedMode)}
          value={state.selectedMode}
          startDecorator={<Icon.File className="w-4 h-auto" />}
        >
          <Option value="local-file">{t("resource.create-dialog.local-file.option")}</Option>
          <Option value="external-link">{t("resource.create-dialog.external-link.option")}</Option>
        </Select>

        {state.selectedMode === "local-file" && (
          <>
            <div className="w-full relative bg-blue-50 dark:bg-zinc-900 rounded-md flex flex-row justify-center items-center py-8">
              <label htmlFor="files" className="p-2 px-4 text-sm text-white cursor-pointer bg-blue-500 block rounded hover:opacity-80">
                {t("resource.create-dialog.local-file.choose")}
              </label>
              <input
                className="absolute inset-0 w-full h-full opacity-0"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                type="file"
                id="files"
                multiple={true}
                accept="*"
              />
            </div>
            <List size="sm" sx={{ width: "100%" }}>
              {fileList.map((file) => (
                <Tooltip title={file.name} key={file.name} placement="top">
                  <ListItem>
                    <Typography noWrap>{file.name}</Typography>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </>
        )}

        {state.selectedMode === "external-link" && (
          <>
            <Typography className="!mb-1" level="body2">
              {t("resource.create-dialog.external-link.link")}
            </Typography>
            <Input
              className="mb-2"
              placeholder={t("resource.create-dialog.external-link.link-placeholder")}
              value={resourceCreate.externalLink}
              onChange={handleExternalLinkChanged}
              fullWidth
            />
            <Typography className="!mb-1" level="body2">
              {t("resource.create-dialog.external-link.file-name")}
            </Typography>
            <Input
              className="mb-2"
              placeholder={t("resource.create-dialog.external-link.file-name-placeholder")}
              value={resourceCreate.filename}
              onChange={handleFileNameChanged}
              fullWidth
            />
            <Typography className="!mb-1" level="body2">
              {t("resource.create-dialog.external-link.type")}
            </Typography>
            <Autocomplete
              className="w-full"
              size="sm"
              placeholder={t("resource.create-dialog.external-link.type-placeholder")}
              freeSolo={true}
              options={fileTypeAutocompleteOptions}
              onChange={(_, value) => handleFileTypeChanged(value || "")}
            />
          </>
        )}

        <div className="mt-2 w-full flex flex-row justify-end items-center space-x-1">
          <Button variant="plain" color="neutral" onClick={handleCloseDialog}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleConfirmBtnClick} loading={state.uploadingFlag} disabled={!allowConfirmAction()}>
            {t("common.create")}
          </Button>
        </div>
      </div>
    </>
  );
};

function showCreateResourceDialog(props: Omit<Props, "destroy" | "hide">) {
  generateDialog<Props>(
    {
      dialogName: "create-resource-dialog",
    },
    CreateResourceDialog,
    props
  );
}

export default showCreateResourceDialog;
