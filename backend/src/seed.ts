import { DataSource } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { Medico } from './entities/medico.entity.js';
import { Reserva } from './entities/reserva.entity.js';
import { EstadoUsuario, RolUsuario } from './entities/enums.js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    database: process.env.DB_NAME || 'clinica_db',
    entities: [Usuario, Medico, Reserva],
    synchronize: true,
});

async function runSeed() {
    await AppDataSource.initialize();
    console.log('✔ Conexión establecida con éxito');

    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const medicoRepo = AppDataSource.getRepository(Medico);
    const salt = await bcrypt.genSalt(10);
    const claveHasheada = await bcrypt.hash('Password123!', salt);

    let admin = await usuarioRepo.findOne({ where: { documento: '10000001' } });
    if (!admin) {
        admin = usuarioRepo.create({
            documento: '10000001',
            nombres: 'Florencia Agustina',
            apellidos: 'Mammana',
            email: 'admin@clinica.com',
            rol: RolUsuario.ADMINISTRADOR,
        });
        await usuarioRepo.save(admin);
        console.log('✔ Administrador creado: admin@clinica.com / Password123!');
    }

    let userMed1 = await usuarioRepo.findOne({ where: { documento: '20000001' } });
    if (!userMed1) {
        userMed1 = usuarioRepo.create({
            documento: '20000001',
            nombres: 'Esteban',
            apellidos: 'Favaloro',
            email: 'medico1@clinica.com',
            clave: claveHasheada,
            estado: EstadoUsuario.ACTIVO,
            rol: RolUsuario.MEDICO,
        });
        await usuarioRepo.save(userMed1);

        const med1 = medicoRepo.create({
            id_usuario: userMed1.id,
            matricula: 112233,
            valor_consulta: 15000,
        });
        await medicoRepo.save(med1);
        console.log('✔ Médico creado: medico1@clinica.com / Password123! (Arancel: $15.000)');
    }

    let pac1 = await usuarioRepo.findOne({ where: { documento: '30000001' } });
    if (!pac1) {
        pac1 = usuarioRepo.create({
            documento: '30000001',
            nombres: 'Ana',
            apellidos: 'Pérez',
            email: 'paciente@clinica.com',
            clave: claveHasheada,
            estado: EstadoUsuario.ACTIVO,
            rol: RolUsuario.PACIENTE,
        });
        await usuarioRepo.save(pac1);
        console.log('✔ Paciente activo creado: paciente@clinica.com / Password123!');
    }

    let pacBaja = await usuarioRepo.findOne({ where: { documento: '30000002' } });
    if (!pacBaja) {
        pacBaja = usuarioRepo.create({
            documento: '30000002',
            nombres: 'Lucas',
            apellidos: 'Inactivo',
            email: 'inactivo@clinica.com',
            clave: claveHasheada,
            estado: EstadoUsuario.BAJA,
            rol: RolUsuario.PACIENTE,
        });
        await usuarioRepo.save(pacBaja);
        console.log('✔ Paciente en BAJA creado: inactivo@clinica.com / Password123!');
    }

    console.log('--- Seed completado con éxito ---');
    await AppDataSource.destroy();
}

runSeed().catch((err) => {
    console.error('Error ejecutando seed:', err);
    process.exit(1);
});