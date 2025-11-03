import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface StudentUploadData {
  name: string;
  rollNumber: string;
  roomNumber: string;
  floorNumber: number;
  bedNumber: number;
  email?: string;
  phone?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  uploaded: number;
  failed: number;
}

export default function StudentUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setUploading(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        await handleCSVUpload(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await handleExcelUpload(file);
      } else {
        setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCSVUpload = (file: File) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            await processStudentData(results.data);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => {
          reject(new Error('Failed to parse CSV file: ' + err.message));
        }
      });
    });
  };

  const handleExcelUpload = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    await processStudentData(jsonData);
  };

  const processStudentData = async (data: any[]) => {
    if (!data || data.length === 0) {
      throw new Error('No data found in file');
    }

    const students: StudentUploadData[] = [];
    const errors: string[] = [];

    data.forEach((row: any, index: number) => {
      try {
        const student: StudentUploadData = {
          name: row.name || row.Name || row.NAME || '',
          rollNumber: String(row.rollNumber || row['Roll Number'] || row.roll_number || ''),
          roomNumber: String(row.roomNumber || row['Room Number'] || row.room_number || ''),
          floorNumber: parseInt(row.floorNumber || row['Floor Number'] || row.floor_number || '0'),
          bedNumber: parseInt(row.bedNumber || row['Bed Number'] || row.bed_number || '0'),
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || ''
        };

        if (!student.name) throw new Error('Name is required');
        if (!student.rollNumber) throw new Error('Roll Number is required');
        if (!student.roomNumber) throw new Error('Room Number is required');
        if (!student.floorNumber || student.floorNumber < 1 || student.floorNumber > 8) {
          throw new Error('Floor Number must be between 1 and 8');
        }
        if (!student.bedNumber || student.bedNumber < 1) {
          throw new Error('Bed Number is required');
        }

        students.push(student);
      } catch (err: any) {
        errors.push(`Row ${index + 2}: ${err.message}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
    }

    const uploadResult = await uploadStudentsToSupabase(students);
    setResult(uploadResult);
    
    toast({
      title: 'Success!',
      description: uploadResult.message,
    });
  };

  const uploadStudentsToSupabase = async (students: StudentUploadData[]): Promise<UploadResult> => {
    try {
      const studentsToInsert = students.map(student => ({
        name: student.name,
        roll_number: student.rollNumber,
        room_number: student.roomNumber,
        floor_number: student.floorNumber,
        bed_number: student.bedNumber,
        email: student.email || null,
        phone: student.phone || null,
      }));

      const { data, error } = await supabase
        .from('students')
        .insert(studentsToInsert)
        .select();

      if (error) throw error;

      return {
        success: true,
        message: `Successfully uploaded ${data?.length || 0} students`,
        uploaded: data?.length || 0,
        failed: students.length - (data?.length || 0)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload students');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Upload Student Data</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file with student information. Required columns: name, rollNumber, roomNumber, floorNumber, bedNumber
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </>
          )}
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line break-words">{error}</AlertDescription>
        </Alert>
      )}

      {result && result.success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {result.message}
            {result.failed > 0 && ` (${result.failed} failed)`}
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm font-medium">Expected CSV/Excel Format:</p>
            <div className="space-y-2">
              <div className="text-xs bg-background p-3 rounded border">
                <p className="font-semibold mb-2">Required Columns:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="font-mono">name</span> - Student's full name</li>
                  <li>• <span className="font-mono">rollNumber</span> - Roll number</li>
                  <li>• <span className="font-mono">roomNumber</span> - Room number</li>
                  <li>• <span className="font-mono">floorNumber</span> - Floor (1-8)</li>
                  <li>• <span className="font-mono">bedNumber</span> - Bed number</li>
                </ul>
                <p className="font-semibold mt-3 mb-2">Optional Columns:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="font-mono">email</span> - Email address</li>
                  <li>• <span className="font-mono">phone</span> - Phone number</li>
                </ul>
              </div>
              <div className="text-xs bg-background p-3 rounded border">
                <p className="font-semibold mb-2">Example:</p>
                <div className="text-muted-foreground break-all">
                  <p className="mb-1">John Doe, 2023001, 101, 1, 1</p>
                  <p>Jane Smith, 2023002, 102, 1, 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}