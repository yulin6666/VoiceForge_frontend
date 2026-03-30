export interface DialogueLine {
  id: string;
  character: string;
  text: string;
}

export interface Voice {
  voice_id: string;
  name: string;
}

export interface ProgressEvent {
  completed: number;
  total: number;
  current_id: string;
  error: string | null;
}
