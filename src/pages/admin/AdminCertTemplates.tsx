import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { Upload, FileText, Award, HandHeart, Landmark } from 'lucide-react';

type CertType = 'community_service' | 'general_proficiency' | 'sal_activity';
type DbCertType = 'community_service' | 'general_proficiency';

const TYPES: { value: CertType; label: string; icon: any }[] = [
  { value: 'community_service', label: 'Community Service', icon: HandHeart },
  { value: 'general_proficiency', label: 'General Proficiency', icon: Award },
  { value: 'sal_activity', label: 'SAL Activities', icon: Landmark },
];

function TemplateCard({ type, label, Icon }: { type: CertType; label: string; Icon: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const dbType: DbCertType = type === 'sal_activity' ? 'community_service' : type;

  const { data: tpl } = useQuery({
    queryKey: ['cert-template', type],
    queryFn: async () => {
      const { data } = await supabase.from('certificate_templates').select('*').eq('certificate_type', dbType).maybeSingle();
      return data;
    },
  });

  const [coords, setCoords] = useState({
    name_x: tpl?.name_x ?? 300, name_y: tpl?.name_y ?? 300,
    event_x: tpl?.event_x ?? 300, event_y: tpl?.event_y ?? 250,
    date_x: tpl?.date_x ?? 300, date_y: tpl?.date_y ?? 200,
    font_size: tpl?.font_size ?? 36,
  });

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return toast({ title: 'Unsupported file', description: 'Please upload a PDF or image template.', variant: 'destructive' });
    }
    setUploading(true);
    const path = `${type}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('certificate-templates').upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' }); }

    const payload = {
      certificate_type: dbType,
      template_path: path,
      uploaded_by: user?.id,
      ...coords,
    };
    let resp;
    if (tpl) resp = await supabase.from('certificate_templates').update(payload).eq('id', tpl.id);
    else resp = await supabase.from('certificate_templates').insert(payload);
    setUploading(false);
    if (resp.error) return toast({ title: 'Save failed', description: resp.error.message, variant: 'destructive' });
    toast({ title: 'Template uploaded' });
    qc.invalidateQueries({ queryKey: ['cert-template', type] });
  };

  const saveCoords = async () => {
    if (!tpl) return toast({ title: 'Upload a template first', variant: 'destructive' });
    const { error } = await supabase.from('certificate_templates').update(coords).eq('id', tpl.id);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Positions saved' });
    qc.invalidateQueries({ queryKey: ['cert-template', type] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="w-5 h-5 text-primary" />{label}</CardTitle>
        <CardDescription>
          {tpl ? <span className="text-success">Template uploaded ✓</span> : 'No template uploaded yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input type="file" accept="application/pdf,image/*" onChange={upload} disabled={uploading} />
          {uploading && <span className="text-sm text-muted-foreground">Uploading…</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><Label className="text-xs">Name X</Label><Input type="number" value={coords.name_x} onChange={(e) => setCoords({ ...coords, name_x: +e.target.value })} /></div>
          <div><Label className="text-xs">Name Y</Label><Input type="number" value={coords.name_y} onChange={(e) => setCoords({ ...coords, name_y: +e.target.value })} /></div>
          <div><Label className="text-xs">Event X</Label><Input type="number" value={coords.event_x} onChange={(e) => setCoords({ ...coords, event_x: +e.target.value })} /></div>
          <div><Label className="text-xs">Event Y</Label><Input type="number" value={coords.event_y} onChange={(e) => setCoords({ ...coords, event_y: +e.target.value })} /></div>
          <div><Label className="text-xs">Date X</Label><Input type="number" value={coords.date_x} onChange={(e) => setCoords({ ...coords, date_x: +e.target.value })} /></div>
          <div><Label className="text-xs">Date Y</Label><Input type="number" value={coords.date_y} onChange={(e) => setCoords({ ...coords, date_y: +e.target.value })} /></div>
          <div><Label className="text-xs">Font Size</Label><Input type="number" value={coords.font_size} onChange={(e) => setCoords({ ...coords, font_size: +e.target.value })} /></div>
        </div>
        <Button onClick={saveCoords} variant="outline" size="sm">Save positions</Button>
        <p className="text-xs text-muted-foreground">Upload PDF or image templates. Coordinates are PDF points from the bottom-left. Adjust to match your template layout.</p>
      </CardContent>
    </Card>
  );
}

export default function AdminCertTemplates() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> Certificate Templates
          </h1>
          <p className="text-muted-foreground">Upload PDF templates and set field positions. Club admins use these to issue certificates.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TYPES.map(t => <TemplateCard key={t.value} type={t.value} label={t.label} Icon={t.icon} />)}
        </div>
      </div>
    </DashboardLayout>
  );
}
