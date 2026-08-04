<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UtilityApiController extends Controller
{
    // ============ MODULES ============

    public function modules(Request $request)
    {
        $parentOnly = $request->query('parentOnly');

        $all = DB::table('modules')->where('active', 1)->orderBy('urutan')->get();

        $mapModule = function ($m) {
            return [
                'id' => $m->id,
                'kode' => $m->kode,
                'nama' => $m->nama,
                'routeSlug' => $m->route_slug,
                'icon' => $m->icon,
                'parentId' => $m->parent_id,
                'urutan' => $m->urutan,
                'active' => (bool) $m->active,
            ];
        };

        if ($parentOnly) {
            $parents = $all->whereNull('parent_id')->values();
            $data = $parents->map(function ($p) use ($all, $mapModule) {
                $mod = $mapModule($p);
                $children = $all->where('parent_id', $p->id)->values();
                $mod['children'] = $children->map($mapModule)->values();
                return $mod;
            })->values();
        } else {
            $data = $all->map($mapModule)->values();
        }

        return response()->json(['data' => $data]);
    }

    // ============ ROLES ============

    public function rolesIndex(Request $request)
    {
        $roles = DB::table('roles')->orderBy('id')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'kode' => $r->kode,
                'nama' => $r->nama,
                'isSuperAdmin' => (bool) $r->is_super_admin,
                'active' => (bool) $r->active,
            ];
        });

        return response()->json(['data' => $roles]);
    }

    public function rolesShow($id)
    {
        $role = DB::table('roles')->where('id', $id)->first();
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        $permissions = DB::table('role_module_permissions')
            ->where('role_id', $id)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'moduleId' => $p->module_id,
                    'canView' => (bool) $p->can_view,
                    'canCreate' => (bool) $p->can_create,
                    'canEdit' => (bool) $p->can_edit,
                    'canDelete' => (bool) $p->can_delete,
                ];
            });

        return response()->json(['data' => [
            'id' => $role->id,
            'kode' => $role->kode,
            'nama' => $role->nama,
            'isSuperAdmin' => (bool) $role->is_super_admin,
            'active' => (bool) $role->active,
            'modulePermissions' => $permissions,
        ]]);
    }

    public function rolesStore(Request $request)
    {
        $nama = $request->input('nama');
        $kode = $request->input('kode');
        $isSuperAdmin = (bool) $request->input('isSuperAdmin', false);
        $permissions = $request->input('permissions', []);

        if (!$nama || !$kode) {
            return response()->json(['message' => 'Nama dan kode role wajib diisi'], 422);
        }

        $exists = DB::table('roles')->where('kode', $kode)->exists();
        if ($exists) {
            return response()->json(['message' => 'Kode role sudah digunakan'], 422);
        }

        $roleId = DB::table('roles')->insertGetId([
            'kode' => $kode,
            'nama' => $nama,
            'is_super_admin' => $isSuperAdmin,
            'active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->savePermissions($roleId, $permissions);

        return response()->json(['message' => 'Role baru berhasil dibuat', 'data' => ['id' => $roleId]]);
    }

    public function rolesUpdate(Request $request, $id)
    {
        $role = DB::table('roles')->where('id', $id)->first();
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        $nama = $request->input('nama');
        $isSuperAdmin = (bool) $request->input('isSuperAdmin', false);
        $permissions = $request->input('permissions', []);

        DB::table('roles')->where('id', $id)->update([
            'nama' => $nama,
            'is_super_admin' => $isSuperAdmin,
            'updated_at' => now(),
        ]);

        $this->savePermissions($id, $permissions);

        return response()->json(['message' => 'Role & permissions berhasil diperbarui']);
    }

    public function rolesDeactivate($id)
    {
        $role = DB::table('roles')->where('id', $id)->first();
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        DB::table('roles')->where('id', $id)->update([
            'active' => false,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Role berhasil dinonaktifkan']);
    }

    private function savePermissions($roleId, $permissions)
    {
        DB::table('role_module_permissions')->where('role_id', $roleId)->delete();

        foreach ($permissions as $p) {
            $moduleId = $p['moduleId'] ?? null;
            if (!$moduleId) continue;

            DB::table('role_module_permissions')->insert([
                'role_id' => $roleId,
                'module_id' => $moduleId,
                'can_view' => !empty($p['canView']),
                'can_create' => !empty($p['canCreate']),
                'can_edit' => !empty($p['canEdit']),
                'can_delete' => !empty($p['canDelete']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    // ============ USERS ============

    public function usersIndex(Request $request)
    {
        $search = $request->query('search');

        $query = DB::table('app_users');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('id')->get()->map(function ($u) {
            return $this->enrichUser($u);
        });

        return response()->json(['data' => $users]);
    }

    public function usersStore(Request $request)
    {
        $name = $request->input('name');
        $email = $request->input('email');
        $roleId = $request->input('roleId');
        $mitraId = $request->input('mitraId') ?: null;
        $active = $request->input('active', true);

        if (!$name || !$email || !$roleId) {
            return response()->json(['message' => 'Nama, email, dan role wajib diisi'], 422);
        }

        $exists = DB::table('app_users')->where('email', $email)->exists();
        if ($exists) {
            return response()->json(['message' => 'Email sudah terdaftar'], 422);
        }

        $role = DB::table('roles')->where('id', $roleId)->first();

        $userId = DB::table('app_users')->insertGetId([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password123'),
            'role_id' => $roleId,
            'role_name' => $role->kode ?? '',
            'mitra_id' => $mitraId,
            'active' => $active,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Pengguna baru berhasil ditambahkan', 'data' => ['id' => $userId]]);
    }

    public function usersUpdate(Request $request, $id)
    {
        $user = DB::table('app_users')->where('id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        $roleId = $request->input('roleId');
        $role = $roleId ? DB::table('roles')->where('id', $roleId)->first() : null;

        DB::table('app_users')->where('id', $id)->update([
            'name' => $request->input('name', $user->name),
            'email' => $request->input('email', $user->email),
            'role_id' => $roleId ?: $user->role_id,
            'role_name' => $role->kode ?? $user->role_name,
            'mitra_id' => $request->input('mitraId') ?: null,
            'active' => $request->input('active', $user->active),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Data pengguna berhasil diperbarui']);
    }

    public function usersToggleActive($id)
    {
        $user = DB::table('app_users')->where('id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        DB::table('app_users')->where('id', $id)->update([
            'active' => !$user->active,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Status pengguna berhasil diubah']);
    }

    private function enrichUser($u)
    {
        $role = DB::table('roles')->where('id', $u->role_id)->first();
        $mitra = $u->mitra_id ? DB::table('mitras')->where('id', $u->mitra_id)->first() : null;

        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'roleId' => $u->role_id,
            'mitraId' => $u->mitra_id,
            'active' => (bool) $u->active,
            'role' => $role ? [
                'id' => $role->id,
                'kode' => $role->kode,
                'nama' => $role->nama,
            ] : null,
            'mitra' => $mitra ? [
                'id' => $mitra->id,
                'namaMitra' => $mitra->nama_mitra,
            ] : null,
        ];
    }

    // ============ REFERENSI: MITRAS ============

    public function mitras()
    {
        $mitras = DB::table('mitras')->where('active', 1)->orderBy('nama_mitra')->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'kodeMitra' => $m->kode_mitra,
                'namaMitra' => $m->nama_mitra,
                'jenisMitra' => $m->jenis_mitra,
                'alamat' => $m->alamat,
                'telepon' => $m->telepon,
                'active' => (bool) $m->active,
            ];
        });

        return response()->json(['data' => $mitras]);
    }
}
