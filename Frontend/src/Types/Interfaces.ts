export interface Evaluation {
  id: number;
  name?: string;
  schedule: number;
  observation_date: string;
  evaluation_label: string;
  evaluation_type: string;
  additional_comments?: string;
  instructor?: string;
}

export interface Schedule {
  id: number;
  name: string;
  program: number;
  instructor: number;
  subject: string;
  room: string;
  semester: string;
  year: string;
  section_name?: string;
  subject_name?: string;
  room_name?: string;
  program_name?: string;
  start_time?: string;
  end_time?: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
}

export interface ProgramProfessor {
  id: number;
  program: number;
  professor: number;
  professor_details: Professor;
}

export interface Professor {
  id: number;
  first_name: string;
  last_name: string;
  department?: string;
    profile_picture_url?: string | null;
}
