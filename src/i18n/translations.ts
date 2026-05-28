type Lang = "pt-BR" | "en-US";

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  "pt-BR": {
    login: "Entrar",
    logout: "Sair da Conta",
    theme: "Tema",
    language: "Idioma",
    darkTheme: "Tema Escuro",
    portuguese: "Português",
    english: "English",
    largeFonts: "Fonte Ampliada",
    highContrast: "Alto Contraste",
    accessibility: "ACESSIBILIDADE",
    preferences: "PREFERÊNCIAS",
    editProfile: "Editar Perfil",
    profileTitle: "Perfil",
    myClasses: "Minhas Turmas",
    myClass: "Minha Turma",
    students: "Alunos",
    noClass: "Você não está em nenhuma turma",
    frequency: "Frequência",
    present: "PRESENTE",
    absent: "FALTA",
    cancel: "CANCELAR",
    confirm: "CONFIRMAR",
    save: "SALVAR",
    delete: "Excluir",
    areYouSure: "Você tem certeza absoluta?",
    master: "Mestre",
    practitioner: "Praticante",
    untitledAlbum: "Sem título",
    album: "Álbum",
    addPhoto: "Adicionar Foto",
    noPhotos: "Nenhuma foto no álbum ainda",
    toastError: "Erro",
    toastSuccess: "Sucesso",
    toastWarning: "Aviso",
    toastInfo: "Informação",
    tagline: "Disciplina • Honra • Evolução",
    welcome: "Bem-vindo",
    signInSubtitle: "Faça login para continuar",
    emailPlaceholder: "Seu email",
    passwordPlaceholder: "Sua senha",
    passwordShort: "Senha",
    signInCta: "ENTRAR",
    noAccountPrompt: "Não possui conta?",
    signUpLink: "Cadastre-se",
    invalidCredentials: "Email ou senha inválidos.",
    createAccountTitle: "Criar Conta",
    createAccountSubtitle: "Comece sua jornada agora",
    namePlaceholder: "Seu nome",
    confirmPasswordPlaceholder: "Confirmar senha",
    registerCta: "CADASTRAR",
    haveAccountPrompt: "Já possui conta?",
    signInLink: "Entrar",
    fillAllFields: "Preencha todos os campos.",
    passwordsMismatch: "As senhas não coincidem.",
    registerFailed: "Não foi possível criar a conta.",
    signUpHeroSlogan: "Crie sua conta e entre no coachpad",
    joinClassTitle: "Entrar na Turma",
    joinClassSubtitle: "Escaneie o QR Code ou digite o código.",
    scanQr: "Escanear QR",
    or: "ou",
    classCodePlaceholder: "Código da turma",
    joinClassButton: "Entrar na turma",
    albumMuralTitle: "Mural da Turma",
    albumMuralSubtitle: "Fotos e recordações",
    albumNoClassTitle: "Sem Turma",
    albumNoClassBody:
      "Você precisa entrar em uma turma\npara ver os álbuns de fotos.",
    albumEmptyTitle: "Nenhum álbum publicado",
    albumEmptyBody:
      "O professor ainda não publicou\nnenhuma foto da turma.",
    trainingHistory: "Histórico de Treinos",
    albumsSection: "Álbuns",
    albumsSectionHint: "Fotos e álbuns desta turma",
    trainingSession: "Sessão de Treino",
    deleteSessionTitle: "Excluir Sessão",
    deleteSessionMessage:
      "Tem certeza que deseja apagar esta sessão de treino?",
    sessionCreatedTitle: "Sessão criada",
    sessionCreatedBody: "A sessão de treino foi registrada com sucesso.",
    createSessionErrorTitle: "Erro ao criar",
    createSessionErrorBody: "Verifique sua conexão",
    deleteSessionSuccessTitle: "Sucesso",
    deleteSessionSuccessBody: "Sessão excluída com sucesso.",
    loadSessionsError: "Falha ao carregar as sessões",
    deleteSessionFail: "Não foi possível excluir a sessão.",
    noSessionsTitle: "Nenhuma sessão de treino criada.",
    noSessionsHint: "Toque no botão + acima para criar.",
    newTrainingSession: "Nova Sessão de Treino",
    trainingDateLabel: "Data do Treino",
    activeClassesCount: "turmas ativas",
    studentsCountSuffix: "alunos",
    leaveClassTitle: "Sair da Turma",
    leaveClassConfirmPrefix: "Tem certeza que deseja sair de",
    leave: "Sair",
    leaveClassError: "Não foi possível sair da turma.",
    myClassSubtitle: "Sua turma atual",
    enterClassCta: "Entrar em uma turma",
    noClassShort: "Você ainda não está em nenhuma turma.",
    frequencyTitle: "Frequência",
    frequencySubtitle: "Histórico de presenças",
    loadHistoryError: "Falha ao carregar histórico",
    studentDefault: "Aluno",
    classesLabel: "Aulas",
    classesRecordLabel: "Histórico de Aulas", 
    presenceLabel: "Presenças",
    absencesLabel: "Faltas",
    rateLabel: "Taxa",
    noRecordsYet: "Nenhum registro ainda.",
    trainingSessionDetailTitle: "Presenças",
    saveAttendance: "Salvar presenças",
    saving: "Salvando…",
    noAttendanceChanges: "Nenhuma presença foi alterada.",
    attendanceSaved: "Lista de presenças salva com sucesso!",
    saveAttendanceError: "Erro ao salvar",
    saveAttendanceErrorBody: "Não foi possível salvar a lista.",
    loadSessionError: "Falha ao carregar detalhes da sessão",
    unnamedStudent: "Aluno sem nome",
    generalFrequency: "Frequência geral:",
    noStudentsInClass: "Nenhum aluno cadastrado nesta turma.",
    galleryLabel: "Galeria",
    galleryHero: "GALERIA",
    photoCount_one: "foto",
    practitionerClassTitle: "Turma",
    masterClassesTitle: "Turmas",
    photoCount_other: "fotos",
    tapToExpand: "Toque para ampliar",
    tapToSendPhoto: "Toque no + para enviar",
    loadingPhotos: "Carregando fotos…",
    noPhotosYet: "Nenhuma foto ainda",
    noPhotosMasterHint: "Use o botão abaixo para enviar a primeira imagem ao álbum.",
    noPhotosGuestHint: "Quando o mestre publicar fotos, elas aparecerão aqui.",
    close: "Fechar",
    tapOutsideToClose: "Toque fora da imagem para sair",
    sent: "Enviado",
    photoAdded: "Foto adicionada ao álbum.",
    uploadPhotoError: "Não foi possível enviar a foto.",
    permissionGallery: "Permissão",
    myFrequency: "Ver minhas frequências",
    permissionGalleryBody:
      "É necessário acesso à galeria para enviar fotos.",
    removePhotoTitle: "Remover foto",
    removePhotoMessage:
      "Esta foto será excluída permanentemente do álbum.",
    photoRemovedTitle: "Removida",
    frequencyAnalysis: "Análise de Frequência",
    photoRemovedBody: "A foto foi excluída.",
    deletePhotoError: "Não foi possível excluir a foto.",
    deleteAlbumTitle: "Excluir álbum",
    deleteAlbumMessage:
      "O álbum e todas as fotos serão removidos permanentemente.",
    deleteAlbumConfirmNamed:
      'O álbum "{name}" e todas as fotos serão removidos permanentemente.',
    albumRemovedTitle: "Álbum removido",
    albumRemovedBody: "O álbum foi excluído.",
    deleteAlbumError: "Não foi possível excluir o álbum.",
    invalidAlbum: "Álbum inválido.",
    masterAlbumsSubtitle: "Álbuns de Fotos",
    noAlbumsYet: "Nenhum álbum criado",
    noAlbumsMasterHint:
      "Toque no botão + acima para criar o primeiro álbum desta turma.",
    newAlbum: "Novo Álbum",
    albumTitleLabel: "Título do Álbum",
    albumTitlePlaceholder: "Ex: Graduação 2024",
    create: "CRIAR",
    albumCreated: "Álbum criado com sucesso!",
    albumCreateError: "Não foi possível criar o álbum.",
    albumTitleRequired: "Digite o título do álbum.",
    loadAlbumsError: "Não foi possível carregar os álbuns da turma.",
    loadPhotosError: "Não foi possível carregar as fotos.",
    albumRemovedList: "O álbum foi excluído com sucesso.",
    deleteAlbumConfirmList:
      "O álbum e todas as fotos serão removidos permanentemente.",
    qrSuccessTitle: "Sucesso",
    qrSuccessBody: "Você entrou na turma!",
    qrErrorTitle: "Erro",
    qrErrorBody: "Não foi possível entrar na turma.",
    joiningClass: "Entrando na turma…",
    cameraLoading: "Carregando câmera…",
    cameraPermission: "Permita o acesso à câmera",
    allow: "Permitir",
    noBio: "Sem bio cadastrada",
    nameFieldPlaceholder: "Nome",
    enrolled: "INSCRITO",
    enrolleds: "matriculados",
    yes: "Sim",
    overviewTab: "Visão geral",
    frequencyTab: "Frequência",
    practitioners: "Praticantes",
    sessions: "Sessões",
    avgPresence: "Média presença",
    lastSessions: "Últimas sessões",
    viewAll: "Ver tudo",
    noFrequencyRecords: "Nenhum registro de frequência.",
    loadClassError: "Falha ao carregar dados da turma.",
    classUpdated: "Turma atualizada",
    classCreated: "Turma criada",
    saveClassError: "Erro ao salvar",
    classRemoved: "Turma removida",
    removeClassError: "Erro ao remover",
    editClass: "Editar Turma",
    newClass: "Nova Turma",
    classNamePlaceholder: "Nome da turma",
    deleteClassTitle: "Excluir turma",
    deleteClassMessage: "Esta ação não pode ser desfeita.",
    deleteClassQuestion: "Excluir turma?",
    deleteClassRemoveNamed: "Deseja remover {name}?",
    myFrequencyTitle: "Minha Frequência",
    fullFrequency: "Aproveitamento Total",
    termsCheckboxLabel: "Li e aceito os",
    termsLinkLabel: "Termos de Uso",
    termsRequiredError: "Você precisa aceitar os termos para continuar.",
    termsModalTitle: "Termos de Uso",
    termsModalClose: "Fechar",
    termsModalAccept: "Aceitar e continuar",
    termsBody:
  "Bem-vindo ao CoachPad. Ao utilizar este aplicativo, você concorda com os seguintes Termos de Uso.\n\n" +
  "1. OBJETIVO DO SISTEMA\n" +
  "O CoachPad é uma plataforma destinada ao gerenciamento de academias e turmas de artes marciais, permitindo controle de frequência, organização de sessões de treino, gerenciamento de praticantes, visitantes e compartilhamento de álbuns de fotos.\n\n" +
  "2. CADASTRO E RESPONSABILIDADE DA CONTA\n" +
  "Cada usuário é responsável pelas informações fornecidas durante o cadastro e pela segurança de sua conta.\n" +
  "É proibido compartilhar credenciais de acesso com terceiros.\n\n" +
  "3. TURMAS E FREQUÊNCIA\n" +
  "Instrutores podem criar turmas, sessões de treino e registrar presença dos praticantes.\n" +
  "Os registros de frequência possuem finalidade exclusivamente administrativa e esportiva.\n\n" +
  "4. VISITANTES\n" +
  "O sistema permite registrar visitantes para aulas experimentais.\n" +
  "Cada visitante poderá participar apenas de uma única aula experimental.\n" +
  "Ao cadastrar um visitante, o instrutor declara possuir autorização para utilização das informações fornecidas.\n\n" +
  "5. ÁLBUNS E FOTOS\n" +
  "Fotos publicadas nos álbuns devem respeitar privacidade, direitos de imagem e legislação vigente.\n" +
  "O usuário que realizar o envio da imagem é integralmente responsável pelo conteúdo publicado.\n\n" +
  "6. USO ADEQUADO\n" +
  "É proibido utilizar o CoachPad para:\n" +
  "• Compartilhar conteúdo ofensivo, ilegal ou discriminatório;\n" +
  "• Violar privacidade de terceiros;\n" +
  "• Tentar acessar dados sem autorização;\n" +
  "• Realizar qualquer atividade que comprometa a segurança da plataforma.\n\n" +
  "7. DISPONIBILIDADE DO SERVIÇO\n" +
  "Embora busquemos manter o sistema disponível continuamente, não garantimos funcionamento ininterrupto ou livre de falhas.\n\n" +
  "8. LIMITAÇÃO DE RESPONSABILIDADE\n" +
  "O CoachPad não se responsabiliza por acidentes, lesões ou acontecimentos ocorridos durante treinamentos ou eventos organizados pelas academias.\n\n" +
  "9. EXCLUSÃO DE CONTA E DADOS\n" +
  "Usuários podem solicitar exclusão da conta.\n" +
  "Determinados registros poderão ser mantidos temporariamente para fins legais, históricos e de integridade da plataforma.\n\n" +
  "10. ALTERAÇÕES NOS TERMOS\n" +
  "Os presentes Termos de Uso poderão ser atualizados periodicamente.\n" +
  "O uso contínuo da plataforma após alterações implica concordância com os novos termos.\n\n" +
  "11. CONTATO\n" +
  "Em caso de dúvidas, solicitações ou denúncias, entre em contato pelo suporte oficial do aplicativo.",
    privacyModalTitle: "Política de Privacidade",
    privacyBody:
  "Política de Privacidade - CoachPad\n\n" +
  "1. INTRODUÇÃO\n" +
  "Esta Política de Privacidade descreve como o CoachPad coleta, utiliza, armazena e protege os dados dos usuários, em conformidade com a LGPD (Lei Geral de Proteção de Dados).\n\n" +
  "2. DADOS COLETADOS\n" +
  "O CoachPad poderá coletar:\n" +
  "• Nome;\n" +
  "• Email;\n" +
  "• Telefone;\n" +
  "• Senha criptografada;\n" +
  "• Fotos enviadas para álbuns;\n" +
  "• Registros de frequência;\n" +
  "• Informações de visitantes;\n" +
  "• Dados de uso da aplicação.\n\n" +
  "3. FINALIDADE DO USO DOS DADOS\n" +
  "Os dados são utilizados para:\n" +
  "• Autenticação e acesso ao sistema;\n" +
  "• Gerenciamento de turmas e praticantes;\n" +
  "• Controle de frequência;\n" +
  "• Organização de sessões de treino;\n" +
  "• Compartilhamento de fotos e álbuns;\n" +
  "• Melhorias de segurança e desempenho.\n\n" +
  "4. DADOS DE VISITANTES\n" +
  "Visitantes cadastrados para aulas experimentais possuem seus dados vinculados exclusivamente à sessão de treino correspondente.\n" +
  "Cada visitante poderá utilizar apenas uma aula experimental.\n\n" +
  "5. COMPARTILHAMENTO DE DADOS\n" +
  "O CoachPad não vende informações pessoais.\n" +
  "Os dados poderão ser visualizados apenas por usuários autorizados dentro da plataforma, conforme permissões do sistema.\n\n" +
  "6. SEGURANÇA DAS INFORMAÇÕES\n" +
  "Adotamos medidas de segurança para proteger os dados contra acessos não autorizados, perda, alteração ou divulgação indevida.\n" +
  "As senhas são armazenadas de forma criptografada.\n\n" +
  "7. RETENÇÃO DOS DADOS\n" +
  "Os dados serão mantidos enquanto necessários para funcionamento da plataforma ou cumprimento de obrigações legais.\n" +
  "Após solicitação de exclusão, determinados registros poderão permanecer armazenados temporariamente para integridade histórica do sistema.\n\n" +
  "8. DIREITOS DO USUÁRIO\n" +
  "O usuário poderá solicitar:\n" +
  "• Acesso aos seus dados;\n" +
  "• Correção de informações incorretas;\n" +
  "• Exclusão da conta;\n" +
  "• Revogação de consentimento;\n" +
  "• Portabilidade dos dados, quando aplicável.\n\n" +
  "9. USO DE IMAGENS\n" +
  "O envio de fotos para álbuns implica responsabilidade do usuário sobre autorização de uso de imagem das pessoas fotografadas.\n\n" +
  "10. ALTERAÇÕES NA POLÍTICA\n" +
  "Esta Política de Privacidade poderá ser atualizada periodicamente.\n" +
  "Alterações relevantes poderão ser comunicadas dentro da plataforma.\n\n" +
  "11. CONTATO\n" +
  "Para solicitações relacionadas à privacidade e proteção de dados, utilize os canais oficiais de suporte do CoachPad.",
    privacyLinkLabel: "Política de Privacidade",
    visitantsLabel: "VISITANTES",
    noStudentsFound: "Nenhum aluno encontrado.",
    saveListButton: "SALVAR LISTA",
    newVisitantTitle: "Novo Visitante",
    phonePlaceholder: "Telefone",
    createVisitantButton: "CRIAR VISITANTE",
    visitantBadge: "VISITANTE",
    presentCountLabel: "Presentes",
    totalCountLabel: "Total",
    visitantCreatedTitle: "Visitante criado",
    visitantErrorTitle: "Erro",
    visitantErrorMessage: "Erro ao criar visitante",
  },
  "en-US": {
    login: "Login",
    logout: "Logout",
    theme: "Theme",
    language: "Language",
    darkTheme: "Dark Theme",
    portuguese: "Portuguese",
    english: "English",
    classesRecordLabel: "Classes History",
    largeFonts: "Large Fonts",
    highContrast: "High Contrast",
    accessibility: "ACCESSIBILITY",
    preferences: "PREFERENCES",
    editProfile: "Edit Profile",
    myClasses: "My Classes",
    myClass: "My Class",
    students: "Students",
    noClass: "You are not in any class",
    frequency: "Frequency",
    frequencyAnalysis: "Frequency Analysis",
    present: "PRESENT",
    absent: "ABSENT",
    cancel: "CANCEL",
    confirm: "CONFIRM",
    save: "SAVE",
    delete: "Delete",
    areYouSure: "Are you absolutely sure?",
    master: "Master",
    practitioner: "Practitioner",
    untitledAlbum: "Untitled",
    myFrequency: "My frequencies",
    album: "Album",
    addPhoto: "Add Photo",
    noPhotos: "No photos in the album yet",
    toastError: "Error",
    toastSuccess: "Success",
    toastWarning: "Warning",
    toastInfo: "Info",
    tagline: "Discipline • Honor • Growth",
    welcome: "Welcome",
    signInSubtitle: "Sign in to continue",
    emailPlaceholder: "Your email",
    passwordPlaceholder: "Your password",
    passwordShort: "Password",
    signInCta: "SIGN IN",
    noAccountPrompt: "Don't have an account?",
    signUpLink: "Sign up",
    invalidCredentials: "Invalid email or password.",
    createAccountTitle: "Create account",
    createAccountSubtitle: "Start your journey now",
    namePlaceholder: "Your name",
    confirmPasswordPlaceholder: "Confirm password",
    registerCta: "REGISTER",
    haveAccountPrompt: "Already have an account?",
    signInLink: "Sign in",
    fillAllFields: "Fill in all fields.",
    passwordsMismatch: "Passwords do not match.",
    registerFailed: "Could not create the account.",
    signUpHeroSlogan: "Create your account and join CoachPad",
    joinClassTitle: "Join a class",
    joinClassSubtitle: "Scan the QR code or enter the code.",
    profileTitle: "Profile",
    practitionerClassTitle: "Class",
    masterClassesTitle: "Classes",
    scanQr: "Scan QR",
    or: "or",
    classCodePlaceholder: "Class code",
    joinClassButton: "Join class",
    albumMuralTitle: "Class board",
    albumMuralSubtitle: "Photos and memories",
    albumNoClassTitle: "No class",
    enrolled: "ENROLLED",
    enrolleds: "enrolleds",
    albumNoClassBody:
      "Join a class\nto see photo albums.",
    albumEmptyTitle: "No albums yet",
    albumEmptyBody:
      "Your instructor hasn't published\nany class photos yet.",
    trainingHistory: "Training history",
    albumsSection: "Albums",
    albumsSectionHint: "Photos and albums for this class",
    trainingSession: "Training session",
    deleteSessionTitle: "Delete session",
    deleteSessionMessage:
      "Are you sure you want to delete this training session?",
    sessionCreatedTitle: "Session created",
    sessionCreatedBody: "The training session was saved successfully.",
    createSessionErrorTitle: "Create failed",
    createSessionErrorBody: "Check your connection",
    deleteSessionSuccessTitle: "Success",
    deleteSessionSuccessBody: "Session deleted successfully.",
    loadSessionsError: "Failed to load sessions",
    deleteSessionFail: "Could not delete the session.",
    noSessionsTitle: "No training sessions yet.",
    noSessionsHint: "Tap + above to create one.",
    newTrainingSession: "New training session",
    trainingDateLabel: "Training date",
    activeClassesCount: "active classes",
    studentsCountSuffix: "students",
    leaveClassTitle: "Leave class",
    leaveClassConfirmPrefix: "Are you sure you want to leave",
    leave: "Leave",
    leaveClassError: "Could not leave the class.",
    myClassSubtitle: "Your current class",
    enterClassCta: "Join a class",
    noClassShort: "You are not in any class yet.",
    frequencyTitle: "Attendance",
    frequencySubtitle: "Attendance history",
    loadHistoryError: "Failed to load history",
    studentDefault: "Student",
    classesLabel: "Classes",
    presenceLabel: "Present",
    absencesLabel: "Absences",
    rateLabel: "Rate",
    noRecordsYet: "No records yet.",
    trainingSessionDetailTitle: "Attendance",
    saveAttendance: "Save attendance",
    saving: "Saving…",
    noAttendanceChanges: "No attendance changes.",
    attendanceSaved: "Attendance list saved!",
    saveAttendanceError: "Save failed",
    saveAttendanceErrorBody: "Could not save the list.",
    loadSessionError: "Failed to load session details",
    unnamedStudent: "Unnamed student",
    generalFrequency: "Overall attendance:",
    noStudentsInClass: "No students in this class.",
    galleryLabel: "Gallery",
    galleryHero: "GALLERY",
    photoCount_one: "photo",
    photoCount_other: "photos",
    tapToExpand: "Tap to zoom",
    tapToSendPhoto: "Tap + to upload",
    loadingPhotos: "Loading photos…",
    noPhotosYet: "No photos yet",
    noPhotosMasterHint: "Use the button below to add the first photo.",
    noPhotosGuestHint: "Photos will appear here when your instructor adds them.",
    close: "Close",
    tapOutsideToClose: "Tap outside the image to exit",
    sent: "Sent",
    photoAdded: "Photo added to the album.",
    uploadPhotoError: "Could not upload the photo.",
    permissionGallery: "Permission",
    permissionGalleryBody: "Gallery access is required to upload photos.",
    removePhotoTitle: "Remove photo",
    removePhotoMessage: "This photo will be permanently removed from the album.",
    photoRemovedTitle: "Removed",
    photoRemovedBody: "The photo was deleted.",
    deletePhotoError: "Could not delete the photo.",
    deleteAlbumTitle: "Delete album",
    deleteAlbumMessage:
      "The album and all photos will be permanently removed.",
    deleteAlbumConfirmNamed:
      'The album "{name}" and all photos will be permanently removed.',
    albumRemovedTitle: "Album removed",
    albumRemovedBody: "The album was deleted.",
    deleteAlbumError: "Could not delete the album.",
    invalidAlbum: "Invalid album.",
    masterAlbumsSubtitle: "Photo albums",
    noAlbumsYet: "No albums yet",
    noAlbumsMasterHint:
      "Tap + above to create the first album for this class.",
    newAlbum: "New album",
    albumTitleLabel: "Album title",
    albumTitlePlaceholder: "e.g. Belt test 2024",
    create: "CREATE",
    albumCreated: "Album created successfully!",
    albumCreateError: "Could not create the album.",
    albumTitleRequired: "Enter the album title.",
    loadAlbumsError: "Could not load class albums.",
    loadPhotosError: "Could not load photos.",
    albumRemovedList: "The album was deleted successfully.",
    deleteAlbumConfirmList:
      "The album and all photos will be permanently removed.",
    qrSuccessTitle: "Success",
    qrSuccessBody: "You joined the class!",
    qrErrorTitle: "Error",
    qrErrorBody: "Could not join the class.",
    joiningClass: "Joining class…",
    cameraLoading: "Loading camera…",
    cameraPermission: "Allow camera access",
    allow: "Allow",
    noBio: "No bio yet",
    nameFieldPlaceholder: "Name",
    yes: "Yes",
    overviewTab: "Overview",
    frequencyTab: "Frequency",
    practitioners: "Practitioners",
    sessions: "Sessions",
    avgPresence: "Avg. attendance",
    lastSessions: "Recent sessions",
    viewAll: "See all",
    noFrequencyRecords: "No attendance records.",
    loadClassError: "Failed to load class data.",
    classUpdated: "Class updated",
    classCreated: "Class created",
    saveClassError: "Save failed",
    classRemoved: "Class removed",
    removeClassError: "Remove failed",
    editClass: "Edit class",
    newClass: "New class",
    classNamePlaceholder: "Class name",
    deleteClassTitle: "Delete class",
    deleteClassMessage: "This action cannot be undone.",
    deleteClassQuestion: "Delete class?",
    deleteClassRemoveNamed: "Remove {name}?",
    myFrequencyTitle: "My Frequency",
    fullFrequency: "Full Frequency",
     termsCheckboxLabel: "I have read and accept the",
    termsLinkLabel: "Terms of Use",
    termsRequiredError: "You must accept the terms to continue.",
    termsModalTitle: "Terms of Use",
    termsModalClose: "Close",
    termsModalAccept: "Accept and continue",
    termsBody:
  "Welcome to CoachPad. By using this application, you agree to the following Terms of Use.\n\n" +
  "1. SYSTEM PURPOSE\n" +
  "CoachPad is a platform designed for martial arts schools and class management, allowing attendance control, training session organization, practitioner management, visitor management, and photo album sharing.\n\n" +
  "2. ACCOUNT REGISTRATION AND RESPONSIBILITY\n" +
  "Each user is responsible for the information provided during registration and for maintaining the security of their account.\n" +
  "Sharing login credentials with third parties is prohibited.\n\n" +
  "3. CLASSES AND ATTENDANCE\n" +
  "Instructors may create classes, training sessions, and manage practitioner attendance.\n" +
  "Attendance records are intended exclusively for administrative and sports-related purposes.\n\n" +
  "4. VISITORS\n" +
  "The system allows visitor registration for trial classes.\n" +
  "Each visitor may participate in only one trial class.\n" +
  "By registering a visitor, the instructor declares they have authorization to use the provided information.\n\n" +
  "5. ALBUMS AND PHOTOS\n" +
  "Photos uploaded to albums must respect privacy rights, image rights, and applicable laws.\n" +
  "The user uploading the image is fully responsible for the published content.\n\n" +
  "6. ACCEPTABLE USE\n" +
  "It is prohibited to use CoachPad to:\n" +
  "• Share offensive, illegal, or discriminatory content;\n" +
  "• Violate third-party privacy;\n" +
  "• Attempt unauthorized access to data;\n" +
  "• Perform activities that compromise platform security.\n\n" +
  "7. SERVICE AVAILABILITY\n" +
  "Although we strive to keep the system continuously available, we do not guarantee uninterrupted or error-free operation.\n\n" +
  "8. LIMITATION OF LIABILITY\n" +
  "CoachPad is not responsible for accidents, injuries, or events occurring during training sessions or activities organized by martial arts schools.\n\n" +
  "9. ACCOUNT AND DATA DELETION\n" +
  "Users may request account deletion.\n" +
  "Certain records may be temporarily retained for legal, historical, and platform integrity purposes.\n\n" +
  "10. CHANGES TO THE TERMS\n" +
  "These Terms of Use may be updated periodically.\n" +
  "Continued use of the platform after changes implies acceptance of the updated terms.\n\n" +
  "11. CONTACT\n" +
  "For questions, requests, or reports, please contact the official CoachPad support channels.",
    privacyModalTitle: "Privacy Policy",
    privacyBody:
  "Privacy Policy - CoachPad\n\n" +
  "1. INTRODUCTION\n" +
  "This Privacy Policy describes how CoachPad collects, uses, stores, and protects user data in compliance with applicable data protection laws.\n\n" +
  "2. COLLECTED DATA\n" +
  "CoachPad may collect:\n" +
  "• Name;\n" +
  "• Email address;\n" +
  "• Phone number;\n" +
  "• Encrypted password;\n" +
  "• Photos uploaded to albums;\n" +
  "• Attendance records;\n" +
  "• Visitor information;\n" +
  "• Application usage data.\n\n" +
  "3. PURPOSE OF DATA USAGE\n" +
  "The collected data is used for:\n" +
  "• Authentication and system access;\n" +
  "• Class and practitioner management;\n" +
  "• Attendance tracking;\n" +
  "• Training session organization;\n" +
  "• Photo and album sharing;\n" +
  "• Security and performance improvements.\n\n" +
  "4. VISITOR DATA\n" +
  "Visitor information registered for trial classes is linked exclusively to the corresponding training session.\n" +
  "Each visitor may attend only one trial class.\n\n" +
  "5. DATA SHARING\n" +
  "CoachPad does not sell personal information.\n" +
  "Data may only be viewed by authorized users within the platform according to system permissions.\n\n" +
  "6. INFORMATION SECURITY\n" +
  "We adopt security measures to protect data against unauthorized access, loss, alteration, or improper disclosure.\n" +
  "Passwords are stored in encrypted form.\n\n" +
  "7. DATA RETENTION\n" +
  "Data will be retained as long as necessary for platform functionality or compliance with legal obligations.\n" +
  "After an account deletion request, certain records may remain temporarily stored for historical and system integrity purposes.\n\n" +
  "8. USER RIGHTS\n" +
  "Users may request:\n" +
  "• Access to their personal data;\n" +
  "• Correction of inaccurate information;\n" +
  "• Account deletion;\n" +
  "• Consent revocation;\n" +
  "• Data portability where applicable.\n\n" +
  "9. IMAGE USAGE\n" +
  "Uploading photos to albums implies that the user is responsible for obtaining authorization from individuals appearing in the images.\n\n" +
  "10. POLICY CHANGES\n" +
  "This Privacy Policy may be updated periodically.\n" +
  "Relevant changes may be communicated within the platform.\n\n" +
  "11. CONTACT\n" +
  "For privacy and data protection requests, please use the official CoachPad support channels.",
    privacyLinkLabel: "Privacy Policy",
    visitantsLabel: "VISITORS",
    noStudentsFound: "No students found.",
    saveListButton: "SAVE LIST",
    newVisitantTitle: "New Visitor",
    phonePlaceholder: "Phone",
    createVisitantButton: "CREATE VISITOR",
    visitantBadge: "VISITOR",
    presentCountLabel: "Present",
    totalCountLabel: "Total",
    visitantCreatedTitle: "Visitor created",
    visitantErrorTitle: "Error",
    visitantErrorMessage: "Error creating visitor",
  },
};
