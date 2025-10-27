import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Customer {
  id: number;
  name: string;
  phone: string;
  vehicles: number;
  lastVisit: string;
  status: 'vip' | 'new' | 'regular';
}

const recentCustomers: Customer[] = [
  { id: 1, name: "أحمد محمد الأحمد", phone: "0501234567", vehicles: 2, lastVisit: "منذ يومين", status: "vip" },
  { id: 2, name: "فاطمة سالم النصر", phone: "0559876543", vehicles: 1, lastVisit: "منذ أسبوع", status: "regular" },
  { id: 3, name: "محمد عبدالله الرشيد", phone: "0512345678", vehicles: 3, lastVisit: "اليوم", status: "new" },
  { id: 4, name: "نورة أحمد الزهراني", phone: "0508765432", vehicles: 1, lastVisit: "منذ 3 أيام", status: "vip" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "vip":
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">VIP</Badge>;
    case "new":
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">جديد</Badge>;
    case "regular":
      return <Badge variant="outline">عادي</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function RecentCustomersSection() {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50/50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500 animate-pulse" />
          العملاء الحديثون
        </CardTitle>
        <CardDescription>آخر العملاء المضافين والمحدثين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCustomers.map((customer, index) => (
            <div 
              key={customer.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer group animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate('/crm/customers')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium group-hover:text-blue-600 transition-colors">{customer.name}</h4>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center group-hover:scale-105 transition-transform duration-200">
                  <p className="text-sm font-medium">{customer.vehicles}</p>
                  <p className="text-xs text-muted-foreground">مركبة</p>
                </div>
                <div className="text-center group-hover:scale-105 transition-transform duration-200">
                  <p className="text-sm">{customer.lastVisit}</p>
                  <p className="text-xs text-muted-foreground">آخر زيارة</p>
                </div>
                <div className="group-hover:scale-110 transition-transform duration-200">
                  {getStatusBadge(customer.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}