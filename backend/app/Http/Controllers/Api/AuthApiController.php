<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthApiController extends Controller
{
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $user = DB::table('app_users')->where('email', $email)->first();

        if (!$user || !$user->active || !Hash::check((string) $password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        $token = Str::random(60);
        DB::table('app_users')->where('id', $user->id)->update([
            'api_token' => $token,
            'updated_at' => now(),
        ]);

        $user = DB::table('app_users')->where('id', $user->id)->first();

        return response()->json([
            'data' => [
                'accessToken' => $token,
                'tokenType' => 'Bearer',
                'user' => $this->buildUserPayload($user),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            DB::table('app_users')->where('api_token', $token)->update(['api_token' => null, 'updated_at' => now()]);
        }
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        $token = $request->bearerToken();
        $user = $token ? DB::table('app_users')->where('api_token', $token)->first() : null;

        if (!$user || !$user->active) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json(['data' => $this->buildUserPayload($user)]);
    }

    private function buildUserPayload($u)
    {
        $role = DB::table('roles')->where('id', $u->role_id)->first();

        $modulePermissions = [];
        if ($role) {
            $modulePermissions = DB::table('role_module_permissions')
                ->where('role_id', $role->id)
                ->get()
                ->map(function ($p) {
                    $mod = DB::table('modules')->where('id', $p->module_id)->first();
                    return [
                        'id' => $p->id,
                        'roleId' => $p->role_id,
                        'moduleId' => $p->module_id,
                        'canView' => (bool) $p->can_view,
                        'canCreate' => (bool) $p->can_create,
                        'canEdit' => (bool) $p->can_edit,
                        'canDelete' => (bool) $p->can_delete,
                        // Router guard (src/router/index.ts) & Menu.vue mencocokkan lewat
                        // p.module?.kode / p.module?.id, jadi wajib disertakan bersarang di sini
                        // (meniru bentuk yang sebelumnya dihasilkan MockDb.ts).
                        'module' => $mod ? [
                            'id' => $mod->id,
                            'kode' => $mod->kode,
                            'nama' => $mod->nama,
                            'routeSlug' => $mod->route_slug,
                            'icon' => $mod->icon,
                            'parentId' => $mod->parent_id,
                            'active' => (bool) $mod->active,
                        ] : null,
                    ];
                })->values();
        }

        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'roleId' => $u->role_id,
            'avatarPath' => null,
            'active' => (bool) $u->active,
            'mitraId' => $u->mitra_id,
            'pejabatKomiteId' => $u->pejabat_komite_id,
            'role' => $role ? [
                'id' => $role->id,
                'kode' => $role->kode,
                'nama' => $role->nama,
                'isSuperAdmin' => (bool) $role->is_super_admin,
                'active' => (bool) $role->active,
                'modulePermissions' => $modulePermissions,
            ] : null,
        ];
    }
}
