import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { MensalidadeService } from './mensalidade.service';

@Injectable()
export class BoletoService {
  constructor(private readonly mensalidadeService: MensalidadeService) {}

  async gerarBoleto(id: number, associadoId?: number): Promise<Buffer> {
    const mensalidade = await this.mensalidadeService.findOne(id, associadoId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', (error) => {
        reject(error);
      });

      const associado = mensalidade.associado;
      const valor = Number(mensalidade.valor).toFixed(2);

      const formatarData = (data: string) => {
        const [ano, mes, dia] = data.substring(0, 10).split('-');
        return `${dia}/${mes}/${ano}`;
      };

      const [ano, mes] = mensalidade.mesReferencia.split('-');

      const referencia = `${mes}/${ano}`;

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('REGISTRA+', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(15).text('BOLETO DE MENSALIDADE', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#C0392B')
        .text('DOCUMENTO DEMONSTRATIVO - SEM VALOR BANCÁRIO', {
          align: 'center',
        });

      doc.fillColor('#000000');

      doc.moveDown(2);

      doc.font('Helvetica-Bold').fontSize(12).text('DADOS DO ASSOCIADO');

      doc.moveDown(0.7);

      doc
        .font('Helvetica')
        .fontSize(11)
        .text(`Nome: ${associado.nomeCompleto}`)
        .text(`CPF: ${associado.cpf}`);

      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(12).text('DADOS DA MENSALIDADE');

      doc.moveDown(0.7);

      doc
        .font('Helvetica')
        .fontSize(11)
        .text(`Identificação: ${mensalidade.id}`)
        .text(`Referência: ${referencia}`)
        .text(`Vencimento: ${formatarData(mensalidade.dataVencimento)}`)
        .text(`Valor: R$ ${valor}`)
        .text(`Situação: ${mensalidade.situacao}`);

      if (mensalidade.dataPagamento) {
        doc.text(
          `Data do pagamento: ${formatarData(mensalidade.dataPagamento)}`,
        );
      }

      doc.moveDown(2);

      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(`VALOR: R$ ${valor}`, { align: 'center' });

      doc.moveDown(3);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C0392B')
        .text('ATENÇÃO', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000000')
        .text(
          'Este documento é exclusivamente demonstrativo. ' +
            'Não possui registro bancário, código de barras ou linha digitável. ' +
            'Não pode ser utilizado para pagamento em instituições financeiras.',
          {
            align: 'center',
            lineGap: 4,
          },
        );

      doc.moveDown(3);

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text('Documento gerado pelo sistema Registra+.', { align: 'center' });

      doc.end();
    });
  }
}
