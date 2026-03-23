import bcrypt from 'bcryptjs'
import { usuariosRepository } from '../repositories/usuarios.repository'

export const usuariosService = {
  async listar() {
    const usuarios = await usuariosRepository.findAll()
    return usuarios.map(u => ({
      id:        u.id,
      dni:       u.dni,
      nombres:   u.nombres,
      apellidos: u.apellidos,
      correo:    u.correo,
      rol:       u.rol.nombre,
      area:      u.area?.nombre ?? null,
      activo:    u.activo,
    }))
  },

  async obtener(id: number) {
    const u = await usuariosRepository.findById(id)
    if (!u) throw new Error('Usuario no encontrado')
    return {
      id:        u.id,
      dni:       u.dni,
      nombres:   u.nombres,
      apellidos: u.apellidos,
      correo:    u.correo,
      rol:       u.rol.nombre,
      rolId:     u.rolId,
      area:      u.area?.nombre ?? null,
      areaId:    u.areaId,
      activo:    u.activo,
    }
  },

  async crear(data: {
    dni: string
    nombres: string
    apellidos: string
    correo: string
    password: string
    areaId?: number
    rolId: number
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12)
    return usuariosRepository.create({
      dni:          data.dni,
      nombres:      data.nombres,
      apellidos:    data.apellidos,
      correo:       data.correo,
      passwordHash,
      areaId:       data.areaId,
      rolId:        data.rolId,
    })
  },

  async actualizar(id: number, data: {
    nombres?: string
    apellidos?: string
    correo?: string
    areaId?: number
    rolId?: number
    activo?: boolean
  }) {
    await usuariosRepository.findById(id)
    return usuariosRepository.update(id, data)
  },
}