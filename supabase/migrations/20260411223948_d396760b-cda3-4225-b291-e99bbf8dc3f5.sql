
-- Fix overly permissive RLS on project_services
DROP POLICY "Authenticated users can insert project_services" ON public.project_services;
DROP POLICY "Authenticated users can update project_services" ON public.project_services;
DROP POLICY "Authenticated users can delete project_services" ON public.project_services;

CREATE POLICY "Users can insert project_services for own projects" ON public.project_services
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update project_services for own projects" ON public.project_services
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete project_services for own projects" ON public.project_services
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND projects.user_id = auth.uid()));
