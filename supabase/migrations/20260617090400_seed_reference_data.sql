insert into public.athletes (student_id, full_name, rfid_tag, status) values
  ('2024-00001', 'Juan Dela Cruz', 'RFID-TEST-001', true),
  ('2024-00002', 'Maria Santos', 'RFID-TEST-002', true),
  ('2024-00003', 'Pedro Reyes', null, true)
on conflict (student_id) do nothing;
