// Comprehensive i18n dictionary for Anti-Snooze app
// Supports English ('en') and Bahasa Indonesia ('id')

export type AppLanguage = 'en' | 'id';

export const TRANSLATIONS = {
  en: {
    // Navigation
    alarms: 'Alarms',
    stats: 'Stats',
    settings: 'Settings',

    // Home / Alarms List
    active: 'Active',
    inactive: 'Inactive',
    nextIn: 'Next: {h}h {m}m',
    nextInMin: 'Next: {m}m',
    noActiveAlarms: 'No active alarms. Tap + above to create or toggle an alarm on.',
    noAlarmsScheduled: 'No alarms scheduled',
    noAlarmsDesc: 'Tap the + button in the header to create your first anti-snooze alarm.',
    test: 'Test',
    daysMon: 'M',
    daysTue: 'T',
    daysWed: 'W',
    daysThu: 'T',
    daysFri: 'F',
    daysSat: 'S',
    daysSun: 'S',

    // Create / Edit Alarm Modal
    newAlarm: 'New Alarm',
    editAlarm: 'Edit Alarm',
    cancel: 'Cancel',
    save: 'Save Alarm',
    deleteAlarm: 'Delete Alarm',
    repeat: 'Repeat',
    label: 'Label',
    labelPlaceholder: 'e.g. Work, Gym, School',
    wakeUpChallenge: 'Wake-up Challenge',
    mathPuzzle: 'Math Puzzle',
    mathDesc: 'Solve simple arithmetic before alarm stops',
    shakePhone: 'Shake Phone',
    shakeDesc: 'Fill the ring by vigorously shaking phone',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    problemCount: 'Number of Problems',
    shakesRequired: 'Shakes Required',
    alarmVolume: 'Alarm Volume',
    sound: 'Sound',
    vibration: 'Vibration',
    radarTone: 'Radar Chime',
    sirenTone: 'Emergency Siren',
    digitalTone: 'Digital Clock',
    customTone: 'Custom Ringtone',

    // Ringing Screen
    alarmRinging: 'Alarm Ringing',
    startChallenge: 'Start Challenge',
    ringingSubtitle: 'Solve the challenge to turn off the alarm',

    // Challenge Screen
    solveToDismiss: 'Solve to dismiss',
    problemCounter: 'Problem {current} of {total}',
    submit: 'Submit',
    incorrectTryAgain: 'Incorrect, try again!',
    shakeToUnlock: 'Shake to unlock',
    keepShaking: 'Keep shaking!',
    shakeProgress: '{current} / {target} shakes',

    // Success Screen
    alarmDismissed: 'Alarm dismissed',
    dismissedAt: 'Turned off at {time}',
    dayStreak: '{count} day streak',
    streakCount: '{count} Days',
    completedIn: 'Solved in {sec}s',
    done: 'Done',

    // Stats View
    wakeStreak: 'Wake Streak',
    avgWakeTime: 'Avg. Wake Time',
    challengesSolved: 'Challenges Solved',
    last7Days: 'Last 7 Days',
    onTimeRate: '100% On-time',
    noHistoryYet: 'No alarms dismissed yet. Wake up with Anti-Snooze to build your streak!',
    challengeEfficiency: 'Challenge Efficiency',
    avgTimeStat: '{sec}s Avg Time',
    equationsSolved: '{count} equations solved',
    shakesCompleted: '{count} wake-up shakes',
    successRate: 'Success Rate',
    levelTitle: 'Awakener',
    freshStart: 'Fresh Start',
    offlineStored: 'Offline-first • Stored securely on device',
    helloUser: 'Hello, {name}',
    anonymousUser: 'Anti-Snoozer',

    // Settings View
    alarmTestingCode: 'Alarm Testing & Code',
    testAlarmBtn: 'Test Alarm',
    testAlarmDesc: 'Trigger ring & challenge',
    expoCodeBtn: 'Expo Go Code',
    expoCodeDesc: 'React Native source',
    soundVolumeTitle: 'Default Sound & Volume',
    ringtoneSelection: 'Ringtone Selection',
    volumeEscalation: 'Volume Escalation',
    volumeEscalationDesc: 'Ramp volume up to 100% until challenge is solved',
    customAudioTitle: 'Custom Ringtone',
    customAudioDesc: 'Upload MP3, WAV, or AAC audio file',
    customAudioActive: 'Your uploaded audio file',
    uploadBtn: 'Upload',

    // Language & Time Settings
    preferencesTitle: 'App Preferences',
    languageLabel: 'Language',
    languageDesc: 'Choose interface language',
    timeFormatLabel: 'Time Format',
    timeFormatDesc: 'Choose clock display mode',
    timeFormat12: '12-Hour (AM / PM)',
    timeFormat24: '24-Hour (00:00 – 23:59)',

    // Nickname / Profile Settings
    nicknameTitle: 'Your Nickname',
    nicknameDesc: 'Displayed in stats and greetings (stored locally)',
    nicknamePlaceholder: 'Enter your name or nickname',
    saveNickname: 'Save',

    // System Permissions & Offline Info
    offlineTitle: '100% Offline-First',
    zeroCloud: 'Zero Cloud',
    offlineDesc: 'No external server, login, or cloud accounts. All alarms, audio ringtones, streak records, and sound synthesizers live 100% locally in on-device storage.',
    onDeviceStorage: 'On-device Storage',
    activeEncrypted: 'Active (Private)',
    systemAccessTitle: 'System Access & Permissions',
    allGranted: 'All Granted',
    precisionTiming: 'Precision Wake-up Timing',
    precisionDesc: 'Guarantees alarm rings on the exact minute without delay',
    hapticFeedback: 'Haptic Feedback (Vibration)',
    hapticDesc: 'Tactile pulse on alarm ring, shake detection & buttons',
    // Background execution & wake lock
    keepAwakeTitle: 'Screen Wake Lock (Nightstand Mode)',
    keepAwakeDesc: 'Prevents the device screen from sleeping or dimming so the alarm runs without throttling overnight.',
    bgNotificationsTitle: 'Background Web Notifications',
    bgNotificationsDesc: 'Fires loud desktop/system notifications if the browser tab is minimized or in the background.',
    enableNotificationsBtn: 'Enable Notifications',
    notificationActive: 'Active',
    notificationDenied: 'Denied in Browser',
    wakeLockSupported: 'Supported',
    wakeLockUnsupported: 'Not Supported in this Browser',

    resetDataTitle: 'Reset App Data',
    resetDataDesc: 'Wipe alarms, streak, and history back to clean state',
    resetDataBtn: 'Reset All Data',
    resetConfirm: 'Are you sure you want to reset all data and start fresh? This cannot be undone.',

    // Onboarding Modal
    onboardingTitle: 'Welcome to Anti-Snooze',
    stepNameTitle: 'What should I call you?',
    stepNameDesc: 'Enter your nickname so we can personalize your wake-up greetings and stats. This is stored privately on this device.',
    nicknameInputPlaceholder: 'e.g. Alex, Budi, Sarah...',
    nextBtn: 'Next',
    skipBtn: 'Skip',
    stepPermTitle: 'We make sure you actually wake up.',
    stepPermDesc: 'Anti-Snooze eliminates snoozing completely. To guarantee reliable wake-ups, our offline engine requires 3 essential device permissions:',
    exactAlarmTitle: 'Exact Alarm Timing',
    exactAlarmDesc: 'Fires down to the exact second without system power-saving delays.',
    fullScreenTitle: 'Full-Screen Intent',
    fullScreenDesc: 'Overlays lock screen and rings over silent/Do-Not-Disturb modes.',
    batteryTitle: 'Battery Exemption',
    batteryDesc: 'Prevents Android/iOS background task killers from putting your alarm to sleep.',
    grantAccessBtn: 'Grant Access & Start',
    offlineBadge: '100% Offline & Private • Zero Cloud Latency',
  },

  id: {
    // Navigasi
    alarms: 'Alarm',
    stats: 'Statistik',
    settings: 'Pengaturan',

    // Home / Daftar Alarm
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    nextIn: 'Berikutnya: {h}j {m}m',
    nextInMin: 'Berikutnya: {m}m',
    noActiveAlarms: 'Tidak ada alarm aktif. Ketuk + di atas untuk membuat atau menyalakan alarm.',
    noAlarmsScheduled: 'Belum ada jadwal alarm',
    noAlarmsDesc: 'Ketuk tombol + di atas untuk membuat alarm anti-snooze pertamamu.',
    test: 'Uji',
    daysMon: 'S',
    daysTue: 'S',
    daysWed: 'R',
    daysThu: 'K',
    daysFri: 'J',
    daysSat: 'S',
    daysSun: 'M',

    // Modal Buat / Edit Alarm
    newAlarm: 'Alarm Baru',
    editAlarm: 'Edit Alarm',
    cancel: 'Batal',
    save: 'Simpan Alarm',
    deleteAlarm: 'Hapus Alarm',
    repeat: 'Ulangi',
    label: 'Label Alarm',
    labelPlaceholder: 'cth. Kerja, Sekolah, Bangun Pagi',
    wakeUpChallenge: 'Tantangan Bangun Tidur',
    mathPuzzle: 'Teka-teki Matematika',
    mathDesc: 'Selesaikan hitungan sederhana sebelum alarm bisa dimatikan',
    shakePhone: 'Goyang HP',
    shakeDesc: 'Penuhi lingkaran dengan menggoyang HP dengan kuat',
    difficulty: 'Tingkat Kesulitan',
    easy: 'Mudah',
    medium: 'Sedang',
    hard: 'Sulit',
    problemCount: 'Jumlah Soal',
    shakesRequired: 'Target Goyangan',
    alarmVolume: 'Volume Alarm',
    sound: 'Suara',
    vibration: 'Getaran',
    radarTone: 'Radar Chime',
    sirenTone: 'Sirine Darurat',
    digitalTone: 'Jam Digital',
    customTone: 'Nada Dering Kustom',

    // Layar Alarm Berbunyi
    alarmRinging: 'Alarm Berbunyi',
    startChallenge: 'Mulai Tantangan',
    ringingSubtitle: 'Selesaikan tantangan untuk mematikan alarm',

    // Layar Tantangan
    solveToDismiss: 'Selesaikan untuk mematikan alarm',
    problemCounter: 'Soal {current} dari {total}',
    submit: 'Kirim Jawaban',
    incorrectTryAgain: 'Jawaban salah, coba lagi!',
    shakeToUnlock: 'Goyang HP untuk mematikan',
    keepShaking: 'Terus goyang HP-mu!',
    shakeProgress: '{current} / {target} goyangan',

    // Layar Sukses
    alarmDismissed: 'Alarm dimatikan',
    dismissedAt: 'Dimatikan pukul {time}',
    dayStreak: 'Streak {count} hari',
    streakCount: '{count} Hari',
    completedIn: 'Selesai dalam {sec} detik',
    done: 'Selesai',

    // Tampilan Statistik
    wakeStreak: 'Streak Bangun',
    avgWakeTime: 'Rata-rata Bangun',
    challengesSolved: 'Tantangan Selesai',
    last7Days: '7 Hari Terakhir',
    onTimeRate: '100% Tepat Waktu',
    noHistoryYet: 'Belum ada alarm yang dimatikan. Bangun dengan Anti-Snooze untuk membangun streak-mu!',
    challengeEfficiency: 'Efisiensi Tantangan',
    avgTimeStat: '{sec} dtk Rata-rata',
    equationsSolved: '{count} soal terjawab',
    shakesCompleted: '{count} goyangan selesai',
    successRate: 'Tingkat Keberhasilan',
    levelTitle: 'Penakluk Pagi',
    freshStart: 'Mulai Baru',
    offlineStored: 'Offline-first • Tersimpan aman di perangkat',
    helloUser: 'Halo, {name}',
    anonymousUser: 'Pengguna Anti-Snooze',

    // Tampilan Pengaturan
    alarmTestingCode: 'Uji Alarm & Kode',
    testAlarmBtn: 'Uji Alarm',
    testAlarmDesc: 'Picukan bunyi & tantangan',
    expoCodeBtn: 'Kode Expo Go',
    expoCodeDesc: 'Source code React Native',
    soundVolumeTitle: 'Suara & Volume Bawaan',
    ringtoneSelection: 'Pilihan Nada Dering',
    volumeEscalation: 'Eskalasi Volume',
    volumeEscalationDesc: 'Naikkan volume perlahan hingga 100% sampai tantangan diselesaikan',
    customAudioTitle: 'Nada Dering Kustom',
    customAudioDesc: 'Unggah file audio MP3, WAV, atau AAC',
    customAudioActive: 'File audio kustom aktif',
    uploadBtn: 'Unggah',

    // Pengaturan Bahasa & Format Waktu
    preferencesTitle: 'Preferensi Aplikasi',
    languageLabel: 'Bahasa',
    languageDesc: 'Pilih bahasa antarmuka aplikasi',
    timeFormatLabel: 'Format Waktu',
    timeFormatDesc: 'Pilih format tampilan jam',
    timeFormat12: '12-Jam (AM / PM)',
    timeFormat24: '24-Jam (00:00 – 23:59)',

    // Pengaturan Nama Panggilan / Profil
    nicknameTitle: 'Nama Panggilanmu',
    nicknameDesc: 'Ditampilkan pada statistik & sapaan (tersimpan lokal)',
    nicknamePlaceholder: 'Ketik nama panggilanmu',
    saveNickname: 'Simpan',

    // Izin Sistem & Info Offline
    offlineTitle: '100% Offline-First',
    zeroCloud: 'Tanpa Server Cloud',
    offlineDesc: 'Tidak butuh login, server luar, atau akun cloud. Seluruh alarm, rekaman streak, dan audio berjalan 100% lokal di memori HP.',
    onDeviceStorage: 'Penyimpanan Perangkat',
    activeEncrypted: 'Aktif (Privat)',
    systemAccessTitle: 'Akses & Izin Sistem',
    allGranted: 'Semua Diberikan',
    precisionTiming: 'Ketepatan Waktu Alarm',
    precisionDesc: 'Menjamin alarm berbunyi tepat menit tanpa tertunda hemat daya',
    hapticFeedback: 'Umpan Balik Getaran',
    hapticDesc: 'Getaran taktil saat alarm bunyi, sensor goyang & tombol',
    // Background execution & wake lock
    keepAwakeTitle: 'Cegah Layar Tidur (Mode Meja)',
    keepAwakeDesc: 'Mencegah layar HP mati agar alarm web tetap aktif tanpa hambatan semalaman.',
    bgNotificationsTitle: 'Notifikasi Alarm Web',
    bgNotificationsDesc: 'Membunyikan pemberitahuan sistem jika tab browser sedang di latar belakang atau ditutup.',
    enableNotificationsBtn: 'Izinkan Notifikasi',
    notificationActive: 'Aktif',
    notificationDenied: 'Ditolak di Browser',
    wakeLockSupported: 'Didukung',
    wakeLockUnsupported: 'Tidak Didukung di Browser ini',

    resetDataTitle: 'Reset Data Aplikasi',
    resetDataDesc: 'Hapus data alarm, streak, dan riwayat untuk mulai dari nol',
    resetDataBtn: 'Reset Semua Data',
    resetConfirm: 'Yakin ingin mereset seluruh data dan mulai dari awal? Tindakan ini tidak dapat dibatalkan.',

    // Modal Onboarding
    onboardingTitle: 'Selamat Datang di Anti-Snooze',
    stepNameTitle: 'Siapa nama panggilanmu?',
    stepNameDesc: 'Masukkan nama panggilan agar kami bisa mempersonalisasi sapaan dan statistik bangunmu. Data ini hanya tersimpan di perangkat ini.',
    nicknameInputPlaceholder: 'cth. Budi, Sarah, Alex...',
    nextBtn: 'Lanjut',
    skipBtn: 'Lewati',
    stepPermTitle: 'Kami pastikan kamu benar-benar bangun.',
    stepPermDesc: 'Anti-Snooze menghilangkan tombol snooze. Agar alarm berbunyi tanpa henti di waktu yang tepat, mesin offline kami membutuhkan 3 izin esensial:',
    exactAlarmTitle: 'Akses Alarm Tepat Waktu',
    exactAlarmDesc: 'Berbunyi tepat pada detiknya tanpa terhambat mode hemat baterai sistem.',
    fullScreenTitle: 'Layar Penuh (Full-Screen Intent)',
    fullScreenDesc: 'Menimpa layar kunci dan membunyikan alarm meski HP dalam mode hening / Jangan Ganggu.',
    batteryTitle: 'Pengecualian Baterai',
    batteryDesc: 'Mencegah pembunuh tugas latar belakang Android/iOS mematikan alarmmu saat tertidur.',
    grantAccessBtn: 'Beri Akses & Mulai',
    offlineBadge: '100% Offline & Privat • Tanpa Latensi Cloud',
  },
};

export function t(key: keyof typeof TRANSLATIONS['en'], lang?: string, params?: Record<string, string | number>): string {
  const activeLang: AppLanguage = lang === 'id' ? 'id' : 'en';
  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS['en'];
  let str: string = (dict as any)[key] || TRANSLATIONS['en'][key] || String(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return str;
}

/**
 * Formats a time string "HH:MM" (stored in 24h format e.g. "06:30" or "14:45")
 * into either 12-hour AM/PM format (e.g. "06:30 AM", "02:45 PM")
 * or 24-hour format (e.g. "06:30", "14:45")
 */
export function formatTimeString(
  timeStr: string,
  use24Hour: boolean = false
): { timeFormatted: string; period?: string } {
  if (!timeStr) return { timeFormatted: '--:--' };
  const [hStr, mStr] = timeStr.split(':');
  const hNum = parseInt(hStr, 10) || 0;
  const mNum = parseInt(mStr, 10) || 0;
  const minutesFormatted = mNum.toString().padStart(2, '0');

  if (use24Hour) {
    const hoursFormatted = hNum.toString().padStart(2, '0');
    return {
      timeFormatted: `${hoursFormatted}:${minutesFormatted}`,
      period: undefined,
    };
  }

  const period = hNum >= 12 ? 'PM' : 'AM';
  const displayHours = hNum % 12 === 0 ? 12 : hNum % 12;
  return {
    timeFormatted: `${displayHours.toString().padStart(2, '0')}:${minutesFormatted}`,
    period,
  };
}
