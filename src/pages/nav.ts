export interface NavPage {
  path: string;
  icon?: string;
  title?: string;
  adminOnly?: boolean;
}
const pages: readonly NavPage[] = [
  {
    path: '/dashboard',
    icon: 'DashboardIcon',
    title: 'Dashboard',
  },
  {
    path: '/line-item',
    icon: 'ScheduleIcon',
    title: 'Line Items',
  },
  {
    path: '/bookings',
    icon: 'LibraryBooksIcon',
    title: 'Bookings',
  },
  {
    path: '/settings',
    icon: 'SettingsIcon',
    title: 'Settings',
    adminOnly: true,
  },
];

export default pages;
