(function (public) { // Extension de funciones middleware: utilidades

    public.utils = {};  // Metodos con utilidades

    public.utils.saveFile = function (content, fileName, contentType) { // Exportar archivo binario al cliente
        var a = document.createElement("a");
        var file = new Blob([content], {
            type: contentType
        });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    };

    public.utils.downloadXLSX = function(data, fileName, sheetName) { // Generar y exportar archivo .xlsx
        var ws = XLSX.utils.aoa_to_sheet(data);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        var wopts = { bookType:'xlsx', bookSST:false, type:'array' };
        var wbout = XLSX.write(wb, wopts);
        
        public.utils.saveFile(wbout, fileName+'.xlsx',"application/octet-stream");
    };

})(middleware);