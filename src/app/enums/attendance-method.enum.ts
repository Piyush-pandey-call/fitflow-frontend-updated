/** Mirrors com.fitflow.platform.modules.attendance.entity.AttendanceMethod */
export enum AttendanceMethod {
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
}

export const ATTENDANCE_METHOD_LABELS: Record<AttendanceMethod, string> = {
  [AttendanceMethod.QR_CODE]: 'QR Code',
  [AttendanceMethod.MANUAL]: 'Manual',
};
