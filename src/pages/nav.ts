export interface NavPage {
  path: string;
  icon?: string;
  title?: string;
}
const pages: readonly NavPage[] = [
  {
    path: '/dashboard',
    icon: 'DashboardIcon',
    title: 'Dashboard',
  },
  {
    path: '/line-items',
    icon: 'ScheduleIcon',
    title: 'Line Items',
  },
  {
    path: '/bookings',
    icon: 'LibraryBooksIcon',
    title: 'Bookings',
  },
];

export default pages;
