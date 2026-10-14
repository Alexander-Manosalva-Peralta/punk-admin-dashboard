import React from "react";

export const metadata = {
  title: "Políticas de Privacidad — Punk Cobros",
  description: "Políticas de privacidad y tratamiento de datos de la aplicación móvil Punk Cobros conforme a los estándares de Google Play Store.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E5E7EB] p-6 sm:p-12 overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              Documento Oficial de Privacidad
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Políticas de Privacidad y Tratamiento de Datos
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1 break-words">
              Aplicación Móvil: <span className="font-semibold text-[#111827]">Punk</span> (com.parlantecobros.app) | Última actualización: 14 de Octubre de 2026
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Vigente para Google Play
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#374151] break-words">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              1. Identidad del Desarrollador y Alcance
            </h2>
            <p>
              La presente Política de Privacidad regula el tratamiento de datos personales y operativos realizado por la aplicación móvil <strong>Punk</strong> (en adelante, la "Aplicación"), desarrollada para brindar a comercios y emprendedores un asistente de voz y monitor de cobros en tiempo real para billeteras digitales peruanas (incluyendo Yape, Plin y transferencias bancarias autorizadas).
            </p>
            <p className="mt-2">
              Nos comprometemos formalmente a salvaguardar la privacidad de nuestros usuarios y a cumplir con los lineamientos de la <strong>Política de Datos del Usuario de Google Play</strong>, así como con la legislación aplicable de protección de datos personales.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-[#F9FAFB] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                2. Uso Especial del Servicio de Acceso a Notificaciones
              </h2>
              <div className="mt-2">
                <span className="text-[11px] sm:text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-mono break-all inline-block font-semibold">
                  BIND_NOTIFICATION_LISTENER_SERVICE
                </span>
              </div>
            </div>
            <p className="break-words">
              Para cumplir con su función principal —anunciar en voz alta mediante síntesis de voz los pagos recibidos mientras el comerciante atiende a sus clientes sin necesidad de mirar su celular—, la Aplicación solicita el permiso especial de <strong>Acceso a Notificaciones</strong> de Android (<code className="break-all font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-800">android.permission.BIND_NOTIFICATION_LISTENER_SERVICE</code>).
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-[#111827]">Procesamiento 100% Local en el Dispositivo (On-Device):</strong> El análisis del texto de la notificación se ejecuta íntegramente en la memoria RAM del celular mediante expresiones regulares locales. <strong>Ningún contenido de notificación es transmitido a servidores externos ni almacenado en bases de datos remotas.</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-[#111827]">Lista Blanca Estricta de Apps Financieras:</strong> La Aplicación únicamente inspecciona notificaciones emitidas por billeteras electrónicas y entidades bancarias autorizadas en el sistema financiero peruano (como Yape, BCP, Interbank, BBVA, Scotiabank, Banco de la Nación, Tunki, Agora, Izipay y Bim).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✗</span>
                <div>
                  <strong className="text-[#111827]">Filtro y Descarte Absoluto de Mensajería Personal:</strong> Notificaciones provenientes de aplicaciones de mensajería (WhatsApp, Telegram, Messenger, SMS), llamadas, redes sociales, correo electrónico o cualquier app personal son <strong>descartadas de inmediato antes de cualquier procesamiento</strong>.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-[#111827]">Filtro Antispam Financiero:</strong> Notificaciones comerciales o promocionales de bancos (como promociones de sorteos, créditos o campañas de marketing) son filtradas automáticamente para no emitir anuncios erróneos ni confundir al comerciante.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              3. Datos Financieros Sensibles (No Recopilación)
            </h2>
            <p>
              <strong>Punk NUNCA solicita, accede, almacena ni transmite:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#4B5563]">
              <li>Contraseñas, credenciales de banca móvil o códigos PIN.</li>
              <li>Tokens digitales o códigos de autenticación OTP (One-Time Password).</li>
              <li>Números de tarjeta de crédito o débito, fechas de vencimiento o códigos CVV.</li>
              <li>Saldos bancarios totales o estados de cuenta confidenciales.</li>
            </ul>
            <p className="mt-2">
              La Aplicación no tiene capacidad ni permisos para realizar transacciones, debitar fondos o interactuar con el dinero de sus usuarios.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              4. Motor de Síntesis de Voz (Text-to-Speech)
            </h2>
            <p>
              Los anuncios vocales de confirmación de pago se generan a través del motor oficial de <strong>Google Text-to-Speech</strong> o el motor TTS predeterminado instalado en el dispositivo del usuario. La generación de audio se realiza de manera instantánea y privada en el dispositivo, transmitiéndose por el canal multimedia para permitir control físico de volumen.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              5. Información de Cuenta y Licencia
            </h2>
            <p>
              Para gestionar la licencia de uso y prevenir la piratería o uso no autorizado, recopilamos únicamente:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#4B5563]">
              <li><strong>Correo electrónico registrado:</strong> Proporcionado voluntariamente por el usuario para asociar su cuenta comercial.</li>
              <li><strong>Identificador único de instalación (Device Hash):</strong> Un identificador anonimizado y encriptado que vincula la licencia al dispositivo Android donde se activó, impidiendo la duplicación no autorizada de licencias.</li>
            </ul>
            <p className="mt-2">
              Esta información se almacena de forma segura en bases de datos con cifrado estándar TLS/SSL y no se comparte con ningún tercero.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              6. Derechos del Usuario y Revocación de Permisos
            </h2>
            <p>
              El usuario tiene el control total sobre su privacidad en todo momento:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-[#4B5563]">
              <li>
                <strong>Revocación del Permiso de Notificaciones:</strong> Puede desactivar el permiso de lectura en cualquier instante desde: <em>Ajustes del Teléfono → Aplicaciones y Notificaciones → Acceso Especial a Apps → Acceso a Notificaciones → Desactivar Punk</em>.
              </li>
              <li>
                <strong>Interruptor de Anuncio en Voz Alta:</strong> Dentro de la aplicación, el comerciante puede pausar la escucha y los avisos sonoros con un solo toque sin alterar sus configuraciones del sistema.
              </li>
              <li>
                <strong>Eliminación de Cuenta y Datos:</strong> Si desea que su correo electrónico e identificador de licencia sean eliminados de manera definitiva de nuestros servidores, puede solicitarlo enviando un correo a nuestro canal de soporte.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              7. Modificaciones a la Presente Política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente para reflejar mejoras operativas, nuevas funciones de la Aplicación o modificaciones en las regulaciones de Google Play. Cualquier cambio será publicado de manera inmediata en esta dirección web y debidamente notificado en las notas de versión de la aplicación.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-t border-[#E5E7EB] pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-3">
              8. Contacto y Soporte Oficial
            </h2>
            <p>
              Si tiene consultas, sugerencias o requerimientos relacionados con estas políticas de privacidad o el tratamiento de sus datos, puede comunicarse directamente con nuestro equipo de atención:
            </p>
            <div className="mt-3 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] inline-block">
              <p className="font-semibold text-[#111827]">Equipo de Cumplimiento & Soporte Punk</p>
              <p className="text-sm text-[#4B5563] mt-1">
                Correo Electrónico: <a href="mailto:soporte.punkapp@gmail.com" className="text-blue-600 underline font-mono break-all">soporte.punkapp@gmail.com</a>
              </p>
              <p className="text-xs text-[#6B7280] mt-1">Lima, Perú • Desarrollado para comercios y emprendedores</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
