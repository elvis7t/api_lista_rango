import { injectable, inject } from 'tsyringe'
type HarmonizacaoRow = {
    produto: string;
    harmonizacoes: string;
};
@injectable()
export class Conseption {
    constructor() { }


    public async create(data: { Harmonizacao: HarmonizacaoRow[] }) {
        let harmonizacoesArray: string[] = []
        for (const item of data.Harmonizacao) {
            const harmonizacaoString = item.harmonizacoes ?
                item.harmonizacoes.split(',').map(value => value.trim()).filter(value => value.length > 0) : [];
            harmonizacoesArray.push({
                product: Number(item.produto),
                harmonizacoes: harmonizacaoString,
            });
        }

        console.log(JSON.stringify({ Harmonizacao: harmonizacoesArray }, null, 2));

        return { harmonizacoes: harmonizacoesArray }
    };
}
