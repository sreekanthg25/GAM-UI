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
    path: '/orders',
    icon: 'LibraryBooksIcon',
    title: 'Orders',
  },
  {
    path: '/admin-settings',
    icon: 'SettingsIcon',
    title: 'Admin',
    adminOnly: true,
  },
];

export default pages;
