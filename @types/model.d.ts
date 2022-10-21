declare namespace Model {
  interface Log {
    user_id: number;
    created_time: Date;
  }

  interface EditLog extends Log {
    edit_log_id: number;
  }

  interface History extends Log {
    user_exp: number;
    user_name: string;
    log_name: string;
    log: string;
    prev_log: string;
  }

  interface User extends Log {
    user_id: number;
    auth_id: string;
    auth_provider: string;
    user_name: string;
    user_exp: number;
    introduction: string | null;
    email: string | null;
    refresh_token: string | null;
  }

  interface Notification extends Log {
    notification_id: number;
    user_id: number;
    notification_type: string;
    notification_title: string;
    notification_text: string;
    notification_link: string;
  }

  interface POS {
    pos_id: number;
    user_id: number;
    lang_name: string;
    pos_name: string;
    pos_text: string;
  }

  interface Meaning {
    meaning_id: number;
    edit_log_id: number;
    voca_id: number;
    pos_id: number;
    meaning_order: number;
    meaning_text: string;
  }

  interface Example {
    example_id: number;
    edit_log_id: number;
    meaning_id: number;
    example_order: number;
    example_text: string;
    example_translation: string;
  }

  interface MeaningList {
    pos_name: string | null;
    meanings: (Meaning & { examples: Example[] | null })[];
  }

  interface Cognate {
    cognate_id: number;
    edit_log_id: number;
    voca1_id: number;
    voca2_id: number;
  }

  interface Synonym {
    synonym_id: number;
    edit_log_id: number;
    voca1_id: number;
    voca2_id: number;
  }

  interface Antonym {
    antonym_id: number;
    edit_log_id: number;
    voca1_id: number;
    voca2_id: number;
  }

  interface Voca {
    voca_id: number;
    edit_log_id: number;
    lang_name: string;
    headword: string;
    voca_order: number;
    etymology: string;
  }
}
