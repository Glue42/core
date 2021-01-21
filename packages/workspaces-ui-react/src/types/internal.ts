import { CSSProperties, RefObject } from "react";
import { PopupActions, PopupProps } from "reactjs-popup/dist/types";

export interface ElementCreationWrapperState {
  logo?: CreateElementRequestOptions;
  addWorkspace?: CreateElementRequestOptions;
  systemButtons?: CreateElementRequestOptions;
  workspaceContents: CreateWorkspaceContentsRequestOptions[];
  saveWorkspacePopup?: SaveWorkspacePopupComponentProps & CreateElementRequestOptions;
  addApplicationPopup?: AddApplicationPopupComponentProps & CreateElementRequestOptions;
  addWorkspacePopup?: AddWorkspacePopupComponentProps & CreateElementRequestOptions;
}

export interface WorkspacesWrapperProps {
  onCreateLogoRequested?: (options: CreateElementRequestOptions) => void;
  onCreateAddWorkspaceRequested?: (options: CreateElementRequestOptions) => void;
  onCreateSystemButtonsRequested?: (options: CreateElementRequestOptions) => void;
  onCreateWorkspaceContentsRequested?: (options: CreateElementRequestOptions) => void;
  onCreateSaveWorkspacePopupRequested?: (options: SaveWorkspacePopupComponentProps & CreateElementRequestOptions) => void;
  onCreateAddApplicationPopupRequested?: (options: AddApplicationPopupComponentProps & CreateElementRequestOptions) => void;
  onCreateAddWorkspacePopupRequested?: (options: AddWorkspacePopupComponentProps & CreateElementRequestOptions) => void;
  onHideSystemPopupsRequested?: (cb: () => void) => void;
  externalPopupApplications: {
    addApplication: string | undefined;
    saveWorkspace: string | undefined;
    addWorkspace: string | undefined;
  }
  glue?: any;
}

export interface WorkspaceContentsProps {
  workspaceId: string;
}

export interface CreateWorkspaceContentsRequestOptions extends CreateElementRequestOptions {
  workspaceId: string
}


export interface CreateElementRequestOptions {
  domNode: HTMLElement;
  callback?: () => void;
  frameId: string;
  [k: string]: any;
}


export interface PortalProps {
  domNode: HTMLElement
}

export interface WorkspacesManager {
  getFrameId(): string;
  init(componentFactory: any): void;
  notifyMoveAreaChanged(): void;
  notifyWorkspacePopupChanged(element: HTMLElement): string;
  getComponentBounds(): Bounds;
  registerPopup(element: HTMLElement): string;
  removePopup(element: HTMLElement): void;
  removePopupById(elementId: string): void;
  subscribeForWindowFocused(cb: () => any): () => void;
  unmount(): void;
  requestFocus(): void;
}

export interface HeaderComponentProps {
  frameId: string;
  [k: string]: any;
}

export interface WorkspacesProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  components?: {
    header?: {
      LogoComponent?: React.ComponentType<HeaderComponentProps>;
      AddWorkspaceComponent?: React.ComponentType<HeaderComponentProps>;
      SystemButtonsComponent?: React.ComponentType<HeaderComponentProps>;
    };
    WorkspaceContents?: React.ComponentType<WorkspaceContentsProps>;
    popups?: {
      SaveWorkspaceComponent?: React.ComponentType<SaveWorkspacePopupComponentProps> | string;
      AddApplicationComponent?: React.ComponentType<AddApplicationPopupComponentProps> | string;
      AddWorkspaceComponent?: React.ComponentType<AddWorkspacePopupComponentProps> | string;
    };
  };
  glue?: any;
}

export interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ButtonProps extends React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  title?: string;
}

export type AddWorkspaceButtonProps = ButtonProps;
export type CloseFrameButtonProps = ButtonProps;
export type MinimizeFrameButtonProps = ButtonProps;
export type MaximizeFrameButtonProps = ButtonProps;

export interface WorkspacePopupProps extends Omit<PopupProps, "ref"> {
  // bounds: Bounds;
  innerContentStyle?: CSSProperties;
  popupRef?: RefObject<PopupActions>;
}

export type GlueLogoProps = React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

export interface SaveWorkspacePopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  workspaceId: string,
  glue?: any,
  resizePopup: (s: Size) => void,
  hidePopup: () => void,
  buildMode?: boolean,
}

export interface AddApplicationPopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  workspaceId: string;
  glue?: any;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  boxId: string;
  frameId?: string;
  filterApps?: (glueApp: any) => boolean;
}

export interface AddWorkspacePopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  frameId: string,
  glue?: any,
  resizePopup: (s: Size) => void,
  hidePopup: () => void
}

export interface Size {
  width?: number;
  height?: number;
}

export interface AddWorkspacePopupComponentProps {
  frameId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface AddApplicationPopupComponentProps {
  workspaceId: string;
  boxId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface SaveWorkspacePopupComponentProps {
  workspaceId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface ApplicationItemProps {
  appName: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface ApplicationListProps {
  glue: any;
  inLane: boolean;
  parent: any;
  hidePopup: () => void;
  searchTerm: string;
  updatePopupHeight: () => void;
  filterApps?: (glueApplication: any) => boolean;
}

export interface ContainerSwitchProps {
  inLane: boolean;
  setInLane: (b: boolean) => void;
  parent: any;
}

export interface WorkspaceLayoutItemProps {
  name: string,
  onClick: (e: React.MouseEvent) => void,
  onCloseClick: (e: React.MouseEvent) => void
}

export interface WorkspaceLayoutsListProps {
  glue: any;
  frameId: string;
  showFeedback: (errMsg: string) => void;
  hidePopup: () => void;
  resizePopup: () => void;
}

export interface SaveContextCheckboxProps {
  changeChecked: (value: boolean) => void;
  refreshHeight: () => void;
}

export interface SaveWorkspaceButtonProps {
  workspaceId: string;
  inputValue: string;
  clearInput: () => void;
  showFeedback: (errorMsg: string) => void;
  shouldSaveContext: boolean;
  hideFeedback: () => void;
  glue: any;
  hidePopup: () => void;
  buildMode?: boolean;
}

export interface WorkspaceContentsProps {
  workspaceId: string;
}
