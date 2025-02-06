'use client'
import { Button } from "@/components/ui/button";
import { getLastEmailAndComanyInfo } from "@/lib/actions/email-additional";
import { useState } from "react";

export default function Home() {

  const [data, setData] = useState<{ date?: Date; subject?: string; from: string; fromName: string; body: string; revenueEur: string } | null>(null)

  const handleReadEmail = async () => {
    const emailData = await getLastEmailAndComanyInfo()
    if (emailData) {
      setData(emailData)
    }
  }

  return (
    <div className="flex justify-center">
      <div className='w-full md:w-[768px] p-10'>
        <div className="flex flex-col justify-center space-y-5 items-center">
          <h1>Mail helper</h1>
          <Button onClick={handleReadEmail}>
            Read email
          </Button>

          {data && (
            <div>
              <div><b>Date:</b> {data.date?.toISOString().split('T')[0]}</div>
              <div><b>Company revenue:</b> {data.revenueEur} EUR</div>
              <div><b>From:</b> {data.from}</div>
              <div><b>Subject:</b> {data.subject}</div>
              <div><b>Body:</b> {data.body}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
