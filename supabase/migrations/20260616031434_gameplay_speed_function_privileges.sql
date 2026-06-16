revoke execute on function private.clear_lobby_quick_result_undo(uuid) from public, anon;
revoke execute on function private.undo_last_lobby_quick_result(uuid) from public, anon;

grant execute on function private.clear_lobby_quick_result_undo(uuid) to authenticated;
grant execute on function private.undo_last_lobby_quick_result(uuid) to authenticated;
grant execute on function public.undo_last_lobby_quick_result(uuid) to authenticated;
