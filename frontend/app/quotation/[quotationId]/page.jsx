"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pricing } from "@/app/pricing";

export default function QuotationPage() {
  const [quotation, setQuotation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!params.quotationId) {
        setError("No quotation ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/quotation/${params.quotationId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch quotation");
        }

        const data = await response.json();
        setQuotation(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [params.quotationId]);

  // In your quotation page.jsx
  const renderItemTable = (roomItems, roomName) => (
    <Card className="mb-8" key={roomName}>
      <CardHeader>
        <CardTitle>{roomName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Sr.</TableHead>
              <TableHead className="w-[100px]">Picture</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty. Unit</TableHead>
              <TableHead className="text-right">Price (INR)</TableHead>
              <TableHead className="text-right">Total Price (INR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="w-16 h-16 bg-gray-100 rounded"></div>
                </TableCell>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  {roomName === "WholeHousePainting"
                    ? `${quotation.carpetArea} sq ft`
                    : item.isCustom
                    ? "-"
                    : "1"}
                </TableCell>
                <TableCell className="text-right">
                  {item.isCustom ? "-" : item.price.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  {item.isCustom ? "TBD" : item.price.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell colSpan={6} className="text-right">
                Room Total:
              </TableCell>
              <TableCell className="text-right">
                ₹
                {roomItems
                  .reduce((sum, item) => sum + (item.price || 0), 0)
                  .toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderSummary = () => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Project Total Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {Object.entries(
              quotation.details.reduce((acc, item) => {
                if (!acc[item.room]) acc[item.room] = 0;
                acc[item.room] += item.price;
                return acc;
              }, {})
            ).map(([room, total], index) => (
              <TableRow key={room}>
                <TableCell>{`${index + 1} ${room}`}</TableCell>
                <TableCell className="text-right">
                  ₹{total.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell>Gross Total</TableCell>
              <TableCell className="text-right">
                ₹{quotation.totalCost.toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>GST</TableCell>
              <TableCell className="text-right">₹0.00</TableCell>
            </TableRow>
            <TableRow className="font-medium text-lg">
              <TableCell>Net Total After Tax</TableCell>
              <TableCell className="text-right">
                ₹{quotation.totalCost.toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-8 flex justify-between">
          <div>
            <p className="font-medium mb-2">
              For {quotation.customerName || "Customer"}
            </p>
            <p className="text-gray-600">Authorised Signatory</p>
          </div>
          <div>
            <p className="font-medium mb-2">For Warsto</p>
            <p className="text-gray-600">Authorised Signatory</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-800">
              Quotation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600">
              The requested quotation could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(quotation.validUntil) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt="Warsto Logo"
                  width={80}
                  height={80}
                />
                <div>
                  <h1 className="text-2xl font-bold mb-2">Warsto</h1>
                  <p className="text-gray-600">Rajshree Plaza,</p>
                  <p className="text-gray-600">
                    L.B.S Road, Ghatkopar(W), Mumbai
                  </p>
                  <p className="text-gray-600">Maharashtra</p>
                  <p className="text-gray-600">
                    GST No.: {quotation.gstNo || "ABC33510TG5"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold mb-4">Quotation</h2>
                <p>Dated: {new Date().toLocaleDateString()}</p>
                <p className="mt-2 text-amber-600 font-medium">
                  Valid for {daysRemaining} days (until{" "}
                  {new Date(quotation.validUntil).toLocaleDateString()})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(
          quotation.details.reduce((acc, item) => {
            if (!acc[item.room]) acc[item.room] = [];
            acc[item.room].push(item);
            return acc;
          }, {})
        ).map(([room, items]) => renderItemTable(items, room))}

        {renderSummary()}
      </div>
    </div>
  );
}
