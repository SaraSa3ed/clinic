import React, { useMemo, useState } from "react";
import { useGetInsuranceDepositsQuery, useRefundFullDepositMutation, useRefundPartialDepositMutation, useForfeitDepositMutation } from "@/services/insuranceDepositsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const InsuranceDeposits: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState<string>("");
  const { data = [], refetch, isFetching } = useGetInsuranceDepositsQuery({ status: status === "all" ? undefined : status, q }, { refetchOnMountOrArgChange: true } as any);
  const formatGregorian = (value?: string) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("ar-EG-u-ca-gregory", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const [refundFull, { isLoading: loadingFull }] = useRefundFullDepositMutation();
  const [refundPartial, { isLoading: loadingPartial }] = useRefundPartialDepositMutation();
  const [forfeit, { isLoading: loadingForfeit }] = useForfeitDepositMutation();

  const total = useMemo(() => data.reduce((s: number, it: any) => s + Number(it.insurance_amount || 0), 0), [data]);
  const totalRefunded = useMemo(() => data.reduce((s: number, it: any) => s + Number(it.refunded_amount || 0), 0), [data]);

  const handleRefundFull = async (id: number) => {
    try {
      await refundFull({ id }).unwrap();
      toast({ title: "تم رد التأمين كاملاً" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ في رد التأمين", description: e?.data?.message || e?.message, variant: "destructive" });
    }
  };

  const handleRefundPartial = async (id: number) => {
    const amountStr = prompt("أدخل قيمة الاسترجاع الجزئي");
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;
    try {
      await refundPartial({ id, amount }).unwrap();
      toast({ title: "تم رد جزء من التأمين" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ في الرد الجزئي", description: e?.data?.message || e?.message, variant: "destructive" });
    }
  };

  const handleForfeit = async (id: number) => {
    const reason = prompt("سبب المصادرة/التلف؟") || undefined;
    try {
      await forfeit({ id, reason }).unwrap();
      toast({ title: "تم تسجيل مصادرة التأمين" });
      refetch();
    } catch (e: any) {
      toast({ title: "خطأ في المصادرة", description: e?.data?.message || e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مبالغ التأمين</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>السجلات</span>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>إجمالي التأمين: {total.toLocaleString()}</div>
              <div>المُسترجع: {totalRefunded.toLocaleString()}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input placeholder="بحث بالاسم" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="حالة التأمين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="partial_refund">مسترجع جزئيًا</SelectItem>
                <SelectItem value="refunded">مسترجع</SelectItem>
                <SelectItem value="forfeited">مصادَر</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>تحديث</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3">رقم الحجز</th>
                  <th className="text-right p-3">المريض</th>
                  <th className="text-right p-3">الخامه او المنتج</th>
                  <th className="text-right p-3">من</th>
                  <th className="text-right p-3">إلى</th>
                  <th className="text-right p-3">قيمة التأمين</th>
                  <th className="text-right p-3">المُسترجع</th>
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-center p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 font-mono">{row.booking_id}</td>
                    <td className="p-3">{row.customer_name || row?.booking?.customer_name}</td>
                    <td className="p-3">{row?.booking?.product_name || row?.booking?.product_id || "-"}</td>
                    <td className="p-3">{formatGregorian(row?.booking?.start_datetime)}</td>
                    <td className="p-3">{formatGregorian(row?.booking?.end_datetime)}</td>
                    <td className="p-3">{Number(row.insurance_amount || 0).toLocaleString()}</td>
                    <td className="p-3">{Number(row.refunded_amount || 0).toLocaleString()}</td>
                    <td className="p-3">{row.refund_status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Button size="sm" variant="secondary" onClick={() => handleRefundPartial(row.id)} disabled={loadingPartial}>رد جزئي</Button>
                        <Button size="sm" onClick={() => handleRefundFull(row.id)} disabled={loadingFull}>رد كامل</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleForfeit(row.id)} disabled={loadingForfeit}>مصادرة</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">لا توجد سجلات</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceDeposits;


