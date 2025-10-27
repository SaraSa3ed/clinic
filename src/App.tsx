import React, { useState, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BackendStatusNotification } from "@/components/BackendStatusNotification";

// Layout and Pages
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import SupportChatbot from "@/components/SupportChatbot";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import UserSettings from "./pages/UserSettings";
import CompanySettings from "./pages/Settings/CompanySettings";
import BranchSettings from "./pages/Settings/BranchSettings";
import UsersSettings from "./pages/Settings/UsersSettings";
import ThemeSettings from "./pages/Settings/ThemeSettings";
import SystemSettings from "./pages/Settings/SystemSettings";
import ExternalDevicesSettings from "./pages/Settings/ExternalDevicesSettings";
import AdvancedSettings from "./pages/Settings/AdvancedSettings";
import RolesPermissions from "./pages/Settings/RolesPermissions";
import InventoryDashboard from "./pages/Inventory/InventoryDashboard";
import InventoryReports from "./pages/Inventory/InventoryReports";
import Warehouses from "./pages/Inventory/Warehouses";
import Items from "./pages/Inventory/Items";
import PriceList from "./pages/Inventory/PriceList";
import Suppliers from "./pages/Inventory/Suppliers";
import SupplierManagementDashboard from "./pages/Inventory/SupplierManagementDashboard";
import PurchaseOrders from "./pages/Inventory/PurchaseOrders";
import GoodsReceipt from "./pages/Inventory/GoodsReceipt";
import InvoiceProcessing from "./pages/Inventory/InvoiceProcessing";
import PurchaseReturns from "./pages/Inventory/PurchaseReturns";
import DebitNote from "./pages/Inventory/DebitNote";
import InventoryTransactions from "./pages/Inventory/InventoryTransactions";
import WarehouseSettings from "./pages/Inventory/WarehouseSettings";
import OpeningStock from "./pages/Inventory/OpeningStock";
import ProcurementSettings from "./pages/Procurement/ProcurementSettings";
import PurchaseRequisition from "./pages/Procurement/PurchaseRequisition";
import RequestForQuotation from "./pages/Procurement/RequestForQuotation";
import ApprovalWorkflow from "./pages/Procurement/ApprovalWorkflow";
import InventoryMovementLog from "./pages/Inventory/InventoryMovementLog";
import StockTaking from "./pages/Inventory/StockTaking";
import InventoryPolicies from "./pages/Inventory/InventoryPolicies";
import InventoryAnalytics from "./pages/Inventory/InventoryAnalytics";
import AddItemPage from "./pages/AddItemPage";

import SimplePOSSystem from "./pages/POS/SimplePOSSystem";
import POSDashboard from "./pages/POS/POSDashboard";
import ActiveOrders from "./pages/POS/ActiveOrders";
import ShiftManagement from "./pages/POS/ShiftManagement";

import OutstandingInvoices from "./pages/POS/OutstandingInvoices";
import OperationsLog from "./pages/POS/OperationsLog";
import ReportsHub from "./pages/POS/ReportsHub";
import CategoriesSalesReport from "./pages/POS/CategoriesSalesReport";
import ProductsServicesReport from "./pages/POS/ProductsServicesReport";
import ShiftsSalesReport from "./pages/POS/ShiftsSalesReport";
import ShiftsDetailedReport from "./pages/POS/ShiftsDetailedReport";
import ShiftsProfitabilityReport from "./pages/POS/ShiftsProfitabilityReport";
import CategoriesProfitabilityReport from "./pages/POS/CategoriesProfitabilityReport";
import ProductsProfitabilityReport from "./pages/POS/ProductsProfitabilityReport";
import POSSettings from "./pages/Settings/POSSettings";
import POSDevicesSettings from "./pages/Settings/POSDevicesSettings";
import POSPaymentSettings from "./pages/Settings/POSPaymentSettings";
import POSInvoiceSettings from "./pages/Settings/POSInvoiceSettings";
import POSSecuritySettings from "./pages/Settings/POSSecuritySettings";
import POSInventorySettings from "./pages/Settings/POSInventorySettings";
import POSNotificationsSettings from "./pages/Settings/POSNotificationsSettings";
import POSReportsSettings from "./pages/Settings/POSReportsSettings";
import EvaluationManagement from "./pages/POS/EvaluationManagement";
import CheckUpForm from "./pages/POS/EvaluationForms/CheckUpForm";
import EvaluationHistory from "./pages/POS/EvaluationForms/EvaluationHistory";
import EvaluationReports from "./pages/POS/EvaluationForms/EvaluationReports";
import CustomerSatisfactionAnalysis from "./pages/POS/CustomerSatisfactionAnalysis";
import CustomerPayments from "./pages/POS/CustomerPayments";

// CRM Pages
import CRMDashboard from "./pages/CRM/CRMDashboard";
import CustomerManagement from "./pages/CRM/CustomerManagement";
import VehicleManagement from "./pages/CRM/VehicleManagement";

import MarketingCampaigns from "./pages/CRM/MarketingCampaigns";
import CustomerFeedback from "./pages/CRM/CustomerFeedback";
import CustomerSurvey from "./pages/CRM/CustomerSurvey";
import SurveyManagement from "./pages/CRM/SurveyManagement";
import CouponsManagement from "./pages/CRM/CouponsManagement";
import SubscriptionManagement from "./pages/CRM/SubscriptionManagement";
import LoyaltyPointsManagement from "./pages/CRM/LoyaltyPointsManagement";
import CardManagement from "./pages/CRM/CardManagement";

import OperationsManagement from "./pages/Reception/OperationsManagement";
import WorkOrderManagement from "./pages/Reception/WorkOrderManagement";
import UnifiedReceptionDashboard from "./pages/Reception/UnifiedReceptionDashboard";
import CustomerService from "./pages/Reception/CustomerService";
import BookingDashboard from "./pages/Reception/BookingDashboard";
import CreateBooking from "./pages/Reception/CreateBooking";
import BookingsList from "./pages/Reception/BookingsList";
import BookingCalendar from "./pages/Reception/BookingCalendar";
import BookingAnalytics from "./pages/Reception/BookingAnalytics";
import LiveControlCenter from "./pages/Reception/LiveControlCenter";
import ReceptionReports from "./pages/Reception/ReceptionReports";
import InsuranceDeposits from "./pages/Reception/InsuranceDeposits";
import CustomerNotifications from "./pages/Reception/CustomerNotifications";
import SystemIntegration from "./pages/Reception/SystemIntegration";
import { DailyRentalReport } from "./pages/Reports/DailyRentalReport";

// Mobile Wash Pages
import MobileWashDashboard from "./pages/MobileWash/MobileWashDashboard";
import BookingManagement from "./pages/MobileWash/BookingManagement";
import FleetManagement from "./pages/MobileWash/FleetManagement";
import LiveTracking from "./pages/MobileWash/LiveTracking";
import QualityManagement from "./pages/MobileWash/QualityManagement";
import MobileAppManagement from "./pages/MobileWash/MobileAppManagement";

// HCM Pages
import HCMDashboard from './pages/HCM/HCMDashboard';
import Recruitment from './pages/HCM/Recruitment';
import ContractManagementPage from './pages/HCM/ContractManagement';
import EmployeeFiles from './pages/HCM/EmployeeFiles';
import Payroll from './pages/HCM/Payroll';
import Attendance from './pages/HCM/Attendance';
import Performance from './pages/HCM/Performance';
import Offboarding from './pages/HCM/Offboarding';
import EmployeeSelfService from './pages/HCM/EmployeeSelfService';
import CapitalManagement from './pages/HCM/CapitalManagement';
import HCMReports from './pages/HCM/Reports';
import EmployeesReport from './pages/HCM/Reports/EmployeesReport';
import PayrollReport from './pages/HCM/Reports/PayrollReport';
import AttendanceReport from './pages/HCM/Reports/AttendanceReport';
import RecruitmentReport from './pages/HCM/Reports/RecruitmentReport';
import PerformanceReport from './pages/HCM/Reports/PerformanceReport';
import OffboardingReport from './pages/HCM/Reports/OffboardingReport';
import AIManagement from './pages/HCM/AIManagement';
import HCMSettings from './pages/HCM/HCMSettings';
import OrganizationalStructure from './pages/HCM/Settings/OrganizationalStructure';
import JobDefinitions from './pages/HCM/Settings/JobDefinitions';
import SalaryScales from './pages/HCM/Settings/SalaryScales';
import WorkShifts from './pages/HCM/Settings/WorkShifts';
import AdministrativeDefinitions from './pages/HCM/Settings/AdministrativeDefinitions';
import SocialInsuranceSettings from './pages/HCM/Settings/SocialInsuranceSettings';
import RecruitmentPolicies from './pages/HCM/Settings/RecruitmentPolicies';
import PromotionPolicies from './pages/HCM/Settings/PromotionPolicies';
import LeavePolicies from './pages/HCM/Settings/LeavePolicies';
import AttendancePolicies from './pages/HCM/Settings/AttendancePolicies';
import OvertimePolicies from './pages/HCM/Settings/OvertimePolicies';
import DocumentAlerts from './pages/HCM/Settings/DocumentAlerts';
import SalaryPolicies from './pages/HCM/Settings/SalaryPolicies';
import PerformancePolicies from './pages/HCM/Settings/PerformancePolicies';
import ExitPolicies from './pages/HCM/Settings/ExitPolicies';
import HealthSafetyPolicies from './pages/HCM/Settings/HealthSafetyPolicies';
import DocumentTemplates from './pages/HCM/Settings/DocumentTemplates';
import WorkflowAutomation from './pages/HCM/Settings/WorkflowAutomation';
import SelfService from './pages/HCM/Settings/SelfService';
import DigitalArchive from './pages/HCM/Settings/DigitalArchive';
import AnalyticalIndicators from './pages/HCM/Settings/AnalyticalIndicators';

// Accounts Pages
import AccountsDashboard from './pages/Accounts/AccountsDashboard';

// Fixed Assets Pages
import FixedAssetsDashboard from './pages/FixedAssets/FixedAssetsDashboard';

// Accounting Operations Pages
import AccountingOperationsDashboard from './pages/AccountingOperations/AccountingOperationsDashboard';

// Financial Reports Pages
import FinancialReportsDashboard from './pages/FinancialReports/FinancialReportsDashboard';

// Administration Pages
import AdministrationDashboard from './pages/Administration/AdministrationDashboard';
import DocumentManagement from './pages/Administration/DocumentManagement';
import GeneralServices from './pages/Administration/GeneralServices';
import PropertyMaintenance from './pages/Administration/PropertyMaintenance';

// Quality Development Pages
import QualityDevelopmentDashboard from './pages/QualityDevelopment/QualityDevelopmentDashboard';
import QualityPolicies from './pages/QualityDevelopment/QualityPolicies';

// Expenses Pages
import ExpensesManagement from './pages/Expenses/ExpensesManagement';

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background" dir="rtl">
      <div className="flex-1 flex flex-col min-w-0 order-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
      <AppSidebar />
    </div>
  </SidebarProvider>
);

const MemoizedToaster = memo(Toaster);
const MemoizedSonner = memo(Sonner);

const App = () => {
  const [showBackendNotification, setShowBackendNotification] = useState(true);
  const [showSonner, setShowSonner] = useState(false);
  
  React.useEffect(() => {
    // Delay Sonner rendering to avoid potential state conflicts
    const timer = setTimeout(() => setShowSonner(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <ErrorBoundary>
      {showSonner && <MemoizedSonner />}
      <BackendStatusNotification 
        isVisible={showBackendNotification}
        onDismiss={() => setShowBackendNotification(false)}
      />
      <BrowserRouter>
        <SupportChatbot />
        <Routes>
                <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
                <Route path="/user-settings" element={<ProtectedRoute><Layout><UserSettings /></Layout></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/settings/company" element={
              <ProtectedRoute>
                <Layout>
                  <CompanySettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/branches" element={
              <ProtectedRoute>
                <Layout>
                  <BranchSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/warehouses" element={
              <ProtectedRoute>
                <Layout>
                  <Warehouses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/users" element={
              <ProtectedRoute>
                <Layout>
                  <UsersSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/roles" element={
              <ProtectedRoute>
                <Layout>
                  <RolesPermissions />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/themes" element={
              <ProtectedRoute>
                <Layout>
                  <ThemeSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/system" element={
              <ProtectedRoute>
                <Layout>
                  <SystemSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/devices" element={
              <ProtectedRoute>
                <Layout>
                  <ExternalDevicesSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/advanced" element={
              <ProtectedRoute>
                <Layout>
                  <AdvancedSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/security" element={
              <ProtectedRoute>
                <Layout>
                  <AdvancedSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings/account" element={
              <ProtectedRoute>
                <Layout>
                  <UserSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout>
                  <InventoryDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <InventoryDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/items" element={
              <ProtectedRoute>
                <Layout>
                  <Items />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-item" element={
              <ProtectedRoute>
                <Layout>
                  <AddItemPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory/price-list" element={
              <ProtectedRoute>
                <Layout>
                  <PriceList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <Layout>
                  <Suppliers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <SupplierManagementDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Suppliers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers/management" element={
              <Layout>
                <Suppliers />
              </Layout>
            } />
            <Route path="/suppliers/contracts" element={
              <Layout>
                <Suppliers />
              </Layout>
            } />
            <Route path="/suppliers/payments" element={
              <Layout>
                <Suppliers />
              </Layout>
            } />
            <Route path="/suppliers/evaluation" element={
              <Layout>
                <Suppliers />
              </Layout>
            } />
            <Route path="/suppliers/reports" element={
              <Layout>
                <Suppliers />
              </Layout>
            } />
            <Route path="/purchase-orders" element={
              <Layout>
                <PurchaseOrders />
              </Layout>
            } />
            <Route path="/goods-receipt" element={
              <Layout>
                <GoodsReceipt />
              </Layout>
            } />
            <Route path="/invoice-processing" element={
              <Layout>
                <InvoiceProcessing />
              </Layout>
            } />
            <Route path="/purchase-returns" element={
              <Layout>
                <PurchaseReturns />
              </Layout>
            } />
            <Route path="/debit-note" element={
              <Layout>
                <DebitNote />
              </Layout>
            } />
            <Route path="/inventory-transactions" element={
              <Layout>
                <InventoryTransactions />
              </Layout>
            } />
            <Route path="/inventory/opening-stock" element={
              <Layout>
                <OpeningStock />
              </Layout>
            } />
            <Route path="/inventory/settings" element={
              <Layout>
                <WarehouseSettings />
              </Layout>
            } />
            <Route path="/procurement/settings" element={
              <Layout>
                <ProcurementSettings />
              </Layout>
            } />
            <Route path="/procurement/requisition" element={
              <Layout>
                <PurchaseRequisition />
              </Layout>
            } />
            <Route path="/procurement/rfq" element={
              <Layout>
                <RequestForQuotation />
              </Layout>
            } />
            <Route path="/procurement/approval" element={
              <Layout>
                <ApprovalWorkflow />
              </Layout>
            } />
            <Route path="/inventory/movement-log" element={
              <Layout>
                <InventoryMovementLog />
              </Layout>
            } />
            <Route path="/inventory/stocktaking" element={
              <Layout>
                <StockTaking />
              </Layout>
            } />
            <Route path="/inventory/policies" element={
              <Layout>
                <InventoryPolicies />
              </Layout>
            } />
            <Route path="/inventory/analytics" element={
              <Layout>
                <InventoryAnalytics />
              </Layout>
            } />
            <Route path="/inventory/reports" element={
              <Layout>
                <InventoryReports />
              </Layout>
            } />
                            <Route path="/pos" element={<ProtectedRoute><Layout><SimplePOSSystem /></Layout></ProtectedRoute>} />
                            <Route path="/pos/dashboard" element={<ProtectedRoute><Layout><POSDashboard /></Layout></ProtectedRoute>} />
                <Route path="/pos/orders" element={
                  <ProtectedRoute>
                    <Layout>
                      <ActiveOrders />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pos/shifts" element={
                  <ProtectedRoute>
                    <Layout>
                      <ShiftManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pos/outstanding-invoices" element={
                  <ProtectedRoute>
                    <Layout>
                      <OutstandingInvoices />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pos/operations-log" element={
                  <ProtectedRoute>
                    <Layout>
                      <OperationsLog />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pos/reports" element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportsHub />
                    </Layout>
                  </ProtectedRoute>
                } />
                          <Route path="/pos/reports/categories-sales" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoriesSalesReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/products-services" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductsServicesReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/shifts-sales" element={
                <ProtectedRoute>
                  <Layout>
                    <ShiftsSalesReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/shifts-detailed" element={
                <ProtectedRoute>
                  <Layout>
                    <ShiftsDetailedReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/shifts-profitability" element={
                <ProtectedRoute>
                  <Layout>
                    <ShiftsProfitabilityReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/categories-profitability" element={
                <ProtectedRoute>
                  <Layout>
                    <CategoriesProfitabilityReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/reports/products-profitability" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductsProfitabilityReport />
                  </Layout>
                </ProtectedRoute>
              } />
                          <Route path="/pos/evaluation" element={
                <ProtectedRoute>
                  <Layout>
                    <EvaluationManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/evaluation-management" element={
                <ProtectedRoute>
                  <Layout>
                    <EvaluationManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/evaluation-forms/checkup" element={
                <ProtectedRoute>
                  <Layout>
                    <CheckUpForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/evaluation-forms/history" element={
                <ProtectedRoute>
                  <Layout>
                    <EvaluationHistory />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/evaluation-forms/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <EvaluationReports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/customer-satisfaction-analysis" element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerSatisfactionAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pos/customer-payments" element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerPayments />
                  </Layout>
                </ProtectedRoute>
              } />
            <Route path="/settings/pos-settings" element={<ProtectedRoute><Layout><POSSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-devices" element={<ProtectedRoute><Layout><POSDevicesSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-payment" element={<ProtectedRoute><Layout><POSPaymentSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-invoice" element={<ProtectedRoute><Layout><POSInvoiceSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-security" element={<ProtectedRoute><Layout><POSSecuritySettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-inventory" element={<ProtectedRoute><Layout><POSInventorySettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-notifications" element={<ProtectedRoute><Layout><POSNotificationsSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/pos-reports" element={<ProtectedRoute><Layout><POSReportsSettings /></Layout></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><Layout><CRMDashboard /></Layout></ProtectedRoute>} />
            <Route path="/crm/dashboard" element={<ProtectedRoute><Layout><CRMDashboard /></Layout></ProtectedRoute>} />
            <Route path="/crm/customers" element={<ProtectedRoute><Layout><CustomerManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/customer-management" element={<ProtectedRoute><Layout><CustomerManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/customers/new" element={<ProtectedRoute><Layout><CustomerManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/vehicles" element={<ProtectedRoute><Layout><VehicleManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/campaigns" element={<ProtectedRoute><Layout><MarketingCampaigns /></Layout></ProtectedRoute>} />
            <Route path="/crm/campaigns/new" element={<ProtectedRoute><Layout><MarketingCampaigns /></Layout></ProtectedRoute>} />
            <Route path="/crm/feedback" element={<ProtectedRoute><Layout><CustomerFeedback /></Layout></ProtectedRoute>} />
            <Route path="/crm/survey" element={<ProtectedRoute><Layout><CustomerSurvey /></Layout></ProtectedRoute>} />
            <Route path="/crm/surveys" element={<ProtectedRoute><Layout><SurveyManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/coupons" element={<ProtectedRoute><Layout><CouponsManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/subscriptions" element={<ProtectedRoute><Layout><SubscriptionManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/loyalty" element={<ProtectedRoute><Layout><LoyaltyPointsManagement /></Layout></ProtectedRoute>} />
            <Route path="/crm/cards" element={<ProtectedRoute><Layout><CardManagement /></Layout></ProtectedRoute>} />

            <Route path="/reception" element={<ProtectedRoute><Layout><UnifiedReceptionDashboard /></Layout></ProtectedRoute>} />
            <Route path="/reception/dashboard" element={<ProtectedRoute><Layout><UnifiedReceptionDashboard /></Layout></ProtectedRoute>} />
            <Route path="/reception/tracking" element={<ProtectedRoute><Layout><OperationsManagement /></Layout></ProtectedRoute>} />
            <Route path="/operations/management" element={<ProtectedRoute><Layout><OperationsManagement /></Layout></ProtectedRoute>} />
            <Route path="/reception/operations-management" element={<ProtectedRoute><Layout><OperationsManagement /></Layout></ProtectedRoute>} />
            <Route path="/reception/operations-management/work-orders" element={<ProtectedRoute><Layout><WorkOrderManagement /></Layout></ProtectedRoute>} />
            <Route path="/reception/customer-service" element={<ProtectedRoute><Layout><CustomerService /></Layout></ProtectedRoute>} />
            <Route path="/reception/booking-dashboard" element={<ProtectedRoute><Layout><BookingDashboard /></Layout></ProtectedRoute>} />
            <Route path="/reception/create-booking" element={<ProtectedRoute><Layout><CreateBooking /></Layout></ProtectedRoute>} />
            <Route path="/reception/bookings-list" element={<ProtectedRoute><Layout><BookingsList /></Layout></ProtectedRoute>} />
            <Route path="/reception/booking-calendar" element={<ProtectedRoute><Layout><BookingCalendar /></Layout></ProtectedRoute>} />
            <Route path="/reception/booking-analytics" element={<ProtectedRoute><Layout><BookingAnalytics /></Layout></ProtectedRoute>} />
            <Route path="/reception/insurance-deposits" element={<ProtectedRoute><Layout><InsuranceDeposits /></Layout></ProtectedRoute>} />
            <Route path="/reception/live-control-center" element={<ProtectedRoute><Layout><LiveControlCenter /></Layout></ProtectedRoute>} />
            <Route path="/reception/reports" element={<ProtectedRoute><Layout><ReceptionReports /></Layout></ProtectedRoute>} />
            <Route path="/reception/notifications" element={<ProtectedRoute><Layout><CustomerNotifications /></Layout></ProtectedRoute>} />
            <Route path="/reception/integration" element={<ProtectedRoute><Layout><SystemIntegration /></Layout></ProtectedRoute>} />
            <Route path="/reception/system-integration" element={<ProtectedRoute><Layout><SystemIntegration /></Layout></ProtectedRoute>} />
            <Route path="/reports/daily-rental" element={<ProtectedRoute><Layout><DailyRentalReport /></Layout></ProtectedRoute>} />
            
            
            {/* Mobile Wash Routes */}
            <Route path="/mobile-wash" element={<ProtectedRoute><Layout><MobileWashDashboard /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/dashboard" element={<ProtectedRoute><Layout><MobileWashDashboard /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/bookings" element={<ProtectedRoute><Layout><BookingManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/booking-management" element={<ProtectedRoute><Layout><BookingManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/fleet" element={<ProtectedRoute><Layout><FleetManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/fleet-management" element={<ProtectedRoute><Layout><FleetManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/tracking" element={<ProtectedRoute><Layout><LiveTracking /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/live-tracking" element={<ProtectedRoute><Layout><LiveTracking /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/quality" element={<ProtectedRoute><Layout><QualityManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/quality-management" element={<ProtectedRoute><Layout><QualityManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/app" element={<ProtectedRoute><Layout><MobileAppManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/mobile-app" element={<ProtectedRoute><Layout><MobileAppManagement /></Layout></ProtectedRoute>} />
            <Route path="/mobile-wash/app-management" element={<ProtectedRoute><Layout><MobileAppManagement /></Layout></ProtectedRoute>} />
            
            {/* HCM Routes */}
            <Route path="/hcm" element={<ProtectedRoute><Layout><HCMDashboard /></Layout></ProtectedRoute>} />
            <Route path="/hcm/recruitment" element={<ProtectedRoute><Layout><Recruitment /></Layout></ProtectedRoute>} />
            <Route path="/hcm/contracts" element={<ProtectedRoute><Layout><ContractManagementPage /></Layout></ProtectedRoute>} />
            <Route path="/hcm/employee-files" element={<ProtectedRoute><Layout><EmployeeFiles /></Layout></ProtectedRoute>} />
            <Route path="/hcm/payroll" element={<ProtectedRoute><Layout><Payroll /></Layout></ProtectedRoute>} />
            <Route path="/hcm/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
            <Route path="/hcm/performance" element={<ProtectedRoute><Layout><Performance /></Layout></ProtectedRoute>} />
            <Route path="/hcm/offboarding" element={<ProtectedRoute><Layout><Offboarding /></Layout></ProtectedRoute>} />
            <Route path="/hcm/self-service" element={<ProtectedRoute><Layout><EmployeeSelfService /></Layout></ProtectedRoute>} />
            <Route path="/hcm/capital-management" element={<ProtectedRoute><Layout><CapitalManagement /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports" element={<ProtectedRoute><Layout><HCMReports /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/employees" element={<ProtectedRoute><Layout><EmployeesReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/payroll" element={<ProtectedRoute><Layout><PayrollReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/attendance" element={<ProtectedRoute><Layout><AttendanceReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/recruitment" element={<ProtectedRoute><Layout><RecruitmentReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/performance" element={<ProtectedRoute><Layout><PerformanceReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/reports/offboarding" element={<ProtectedRoute><Layout><OffboardingReport /></Layout></ProtectedRoute>} />
            <Route path="/hcm/ai-management" element={<ProtectedRoute><Layout><AIManagement /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings" element={<ProtectedRoute><Layout><HCMSettings /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/organizational-structure" element={<ProtectedRoute><Layout><OrganizationalStructure /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/job-definitions" element={<ProtectedRoute><Layout><JobDefinitions /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/salary-scales" element={<ProtectedRoute><Layout><SalaryScales /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/work-shifts" element={<ProtectedRoute><Layout><WorkShifts /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/administrative-definitions" element={<ProtectedRoute><Layout><AdministrativeDefinitions /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/social-insurance" element={<ProtectedRoute><Layout><SocialInsuranceSettings /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/recruitment-policies" element={<ProtectedRoute><Layout><RecruitmentPolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/promotion-policies" element={<ProtectedRoute><Layout><PromotionPolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/leave-policies" element={<ProtectedRoute><Layout><LeavePolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/attendance-policies" element={<ProtectedRoute><Layout><AttendancePolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/overtime-policies" element={<ProtectedRoute><Layout><OvertimePolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/document-alerts" element={<ProtectedRoute><Layout><DocumentAlerts /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/salary-policies" element={<ProtectedRoute><Layout><SalaryPolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/performance-policies" element={<ProtectedRoute><Layout><PerformancePolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/exit-policies" element={<ProtectedRoute><Layout><ExitPolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/health-safety" element={<ProtectedRoute><Layout><HealthSafetyPolicies /></Layout></ProtectedRoute>} />
            <Route path="/hcm/settings/document-templates" element={<ProtectedRoute><Layout><DocumentTemplates /></Layout></ProtectedRoute>} />
          <Route path="/hcm/settings/workflow-automation" element={<ProtectedRoute><Layout><WorkflowAutomation /></Layout></ProtectedRoute>} />
          <Route path="/hcm/settings/self-service" element={<ProtectedRoute><Layout><SelfService /></Layout></ProtectedRoute>} />
          <Route path="/hcm/settings/digital-archive" element={<ProtectedRoute><Layout><DigitalArchive /></Layout></ProtectedRoute>} />
          <Route path="/hcm/settings/analytics-indicators" element={<ProtectedRoute><Layout><AnalyticalIndicators /></Layout></ProtectedRoute>} />

            {/* Accounts Routes */}
            <Route path="/accounts" element={<ProtectedRoute><Layout><AccountsDashboard /></Layout></ProtectedRoute>} />
            <Route path="/accounts/dashboard" element={<ProtectedRoute><Layout><AccountsDashboard /></Layout></ProtectedRoute>} />

            {/* Fixed Assets Routes */}
            <Route path="/fixed-assets" element={<ProtectedRoute><Layout><FixedAssetsDashboard /></Layout></ProtectedRoute>} />
            <Route path="/fixed-assets/dashboard" element={<ProtectedRoute><Layout><FixedAssetsDashboard /></Layout></ProtectedRoute>} />

            {/* Accounting Operations Routes */}
            <Route path="/accounting-operations" element={<ProtectedRoute><Layout><AccountingOperationsDashboard /></Layout></ProtectedRoute>} />
            <Route path="/accounting-operations/dashboard" element={<ProtectedRoute><Layout><AccountingOperationsDashboard /></Layout></ProtectedRoute>} />

            {/* Financial Reports Routes */}
            <Route path="/financial-reports" element={<ProtectedRoute><Layout><FinancialReportsDashboard /></Layout></ProtectedRoute>} />
            
            {/* Administration Routes */}
            <Route path="/administration" element={<ProtectedRoute><Layout><AdministrationDashboard /></Layout></ProtectedRoute>} />
            <Route path="/administration/documents" element={<ProtectedRoute><Layout><DocumentManagement /></Layout></ProtectedRoute>} />
            <Route path="/administration/services" element={<ProtectedRoute><Layout><GeneralServices /></Layout></ProtectedRoute>} />
            <Route path="/administration/property" element={<ProtectedRoute><Layout><PropertyMaintenance /></Layout></ProtectedRoute>} />
            <Route path="/financial-reports/dashboard" element={<ProtectedRoute><Layout><FinancialReportsDashboard /></Layout></ProtectedRoute>} />
            
            {/* Quality Development Routes */}
            <Route path="/quality-development" element={<ProtectedRoute><Layout><QualityDevelopmentDashboard /></Layout></ProtectedRoute>} />
            <Route path="/quality-development/dashboard" element={<ProtectedRoute><Layout><QualityDevelopmentDashboard /></Layout></ProtectedRoute>} />
            <Route path="/quality-development/policies" element={<ProtectedRoute><Layout><QualityPolicies /></Layout></ProtectedRoute>} />
            
            {/* Expenses Routes */}
            <Route path="/expenses" element={<ProtectedRoute><Layout><ExpensesManagement /></Layout></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    );
  };

export default App;
