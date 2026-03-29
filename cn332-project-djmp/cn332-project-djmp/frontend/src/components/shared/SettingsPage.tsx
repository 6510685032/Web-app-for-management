import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Shield,
  Lock,
  Palette,
  Globe,
  HelpCircle,
  Info,
  ChevronRight,
  Smartphone,
  Database,
  FileText,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: string;
};

function SettingRow({ icon, title, description, status }: SettingRowProps) {
  return (
    <button
      className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors text-left"
      type="button"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {status && (
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const role = user?.role || 'resident';

  const handleBackToDashboard = () => {
    navigate(`/${role}`);
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'officer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'technician':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'resident':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-sm text-white p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Preferences Center</p>
              <h1 className="text-3xl md:text-4xl font-bold">Application Settings</h1>
              <p className="text-blue-100 mt-2 max-w-2xl">
                Manage notification preferences, privacy controls, app behavior, and support tools.
              </p>
            </div>

            <div
              className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border bg-white/90 ${getRoleBadgeColor(
                role
              )}`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <SectionCard
              title="Notifications & Alerts"
              subtitle="Control how the system informs you about requests, updates, and announcements."
            >
              <SettingRow
                icon={<Bell size={22} />}
                title="Push Notifications"
                description="Receive instant updates for maintenance progress, approvals, and important alerts."
                status="Enabled"
              />

              <SettingRow
                icon={<FileText size={22} />}
                title="Announcement Alerts"
                description="Choose whether you want to be notified when new community announcements are posted."
                status="Active"
              />

              <SettingRow
                icon={<Smartphone size={22} />}
                title="Device Notifications"
                description="Manage how alerts appear on your current device and browser."
                status="This device"
              />
            </SectionCard>

            <SectionCard
              title="Privacy & Security"
              subtitle="Review security-related options and control access to your account."
            >
              <SettingRow
                icon={<Shield size={22} />}
                title="Privacy Controls"
                description="Review access permissions and how your account data is handled inside the system."
                status="Protected"
              />

              <SettingRow
                icon={<Lock size={22} />}
                title="Password & Login Security"
                description="Manage password safety, login sessions, and account protection preferences."
                status="Secure"
              />

              <SettingRow
                icon={<Database size={22} />}
                title="Data Usage"
                description="See how system information is used to support requests, records, and platform features."
                status="Standard"
              />
            </SectionCard>

            <SectionCard
              title="Application Preferences"
              subtitle="Customize the way the platform looks and behaves for your usage."
            >
              <SettingRow
                icon={<Palette size={22} />}
                title="Appearance"
                description="Adjust display preferences and future interface personalization options."
                status="Default"
              />

              <SettingRow
                icon={<Globe size={22} />}
                title="Language & Region"
                description="Set language, region, and formatting preferences for dates and content display."
                status="English"
              />
            </SectionCard>

            <SectionCard
              title="Help & Support"
              subtitle="Find guidance, support channels, and useful information about the platform."
            >
              <SettingRow
                icon={<HelpCircle size={22} />}
                title="Support Center"
                description="Get help with account issues, request workflows, and general platform usage."
                status="Available"
              />

              <SettingRow
                icon={<Info size={22} />}
                title="About This System"
                description="View platform information, version details, and general usage notes."
                status="v1.0"
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Notes</h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                  <div className="text-blue-700 font-semibold">Notification Ready</div>
                  <p className="text-blue-600 text-sm mt-1">
                    Stay updated with request progress and important community messages.
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
                  <div className="text-green-700 font-semibold">Security Status</div>
                  <p className="text-green-600 text-sm mt-1">
                    Your account area is currently protected by role-based access.
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
                  <div className="text-orange-700 font-semibold">Preference Preview</div>
                  <p className="text-orange-600 text-sm mt-1">
                    This page is prepared for future preference controls and user settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-3">Why this page is different</h2>
              <ul className="space-y-2 text-slate-200 text-sm leading-6">
                <li>• This page focuses on system preferences.</li>
                <li>• Personal details stay on the View Profile page.</li>
                <li>• No repeated full name, email, phone, or unit blocks here.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
